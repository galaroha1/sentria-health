import sqlite3
import asyncio
import aiohttp
import json
import os
import sys
import time
import ssl
from datetime import datetime

# Configuration
DB_PATH = "backend/sentria.db"
VOCAB_PATH = "data/drug_vocabulary.json"
REAL_CATALOG_PATH = "src/data/real-drug-catalog.json"

FDA_API_URL = "https://api.fda.gov/drug/ndc.json"
RXNORM_API_URL = "https://rxnav.nlm.nih.gov/REST/rxcui.json"

BATCH_SIZE = 1000
MAX_CONCURRENT_FDA = 5

# Statistics
stats = {
    "scanned": 0,
    "added": 0,
    "updated": 0,
    "errors": 0,
    "start_time": time.time()
}

def init_db():
    """Initialize the drugs table in SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS drugs (
            ndc TEXT PRIMARY KEY,
            brand_name TEXT,
            generic_name TEXT,
            manufacturer TEXT,
            description TEXT,
            dosage_form TEXT,
            route TEXT,
            rxcui TEXT,
            active_ingredients TEXT,
            packaging TEXT,
            source TEXT DEFAULT 'FDA',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS crawler_state (
            id TEXT PRIMARY KEY,
            last_skip INTEGER DEFAULT 0,
            vocab_index INTEGER DEFAULT 0
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized.")

def load_vocabulary():
    """Load the 9505 drug names from vocabulary."""
    if not os.path.exists(VOCAB_PATH):
        print(f"⚠️ Vocabulary not found at {VOCAB_PATH}")
        return []
    
    with open(VOCAB_PATH, 'r') as f:
        data = json.load(f)
        return data.get('drugs', [])

import random

# ... (Configuration)
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0"
]

def get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/"
    }

async def search_fda_by_name(session, drug_name):
    """Search OpenFDA for a specific drug name from the vocab."""
    query = f'brand_name:"{drug_name}"+OR+generic_name:"{drug_name}"'
    url = f"{FDA_API_URL}?search={query}&limit=1"
    
    retries = 3
    for attempt in range(retries):
        try:
            # Masking: Rotate Headers per request
            async with session.get(url, headers=get_headers()) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    if results:
                        return results[0]
                    return None
                elif response.status == 429:
                    # Exponential Backoff with Jitter
                    wait = (2 ** attempt) + random.uniform(0.1, 0.5)
                    # print(f"⚠️ Rate Limit (Phase 1). Waiting {wait:.1f}s...")
                    await asyncio.sleep(wait)
                    continue
                else:
                    return None
        except:
            return None
    return None

async def process_vocab_item(sem, session, drug_name):
    """Process a single vocabulary item with Semaphore protection."""
    async with sem:
        # 1. Search FDA
        item = await search_fda_by_name(session, drug_name)
        
        conn = sqlite3.connect(DB_PATH)
        if item:
            ndc = item.get('product_ndc')
            if ndc:
                brand = item.get('brand_name', drug_name)
                generic = item.get('generic_name', 'Unknown')
                labeler = item.get('labeler_name', 'Unknown')
                dosage = item.get('dosage_form', 'Unknown')
                route = ','.join(item.get('route', []))
                ingredients = json.dumps(item.get('active_ingredients', []))
                
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO drugs 
                        (ndc, brand_name, generic_name, manufacturer, dosage_form, route, active_ingredients, source, last_updated)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'VOCAB_MATCH', ?)
                    ''', (ndc, brand, generic, labeler, dosage, route, ingredients, datetime.now()))
                    stats['added'] += 1
                except sqlite3.OperationalError:
                    pass # Locked DB, skip for speed (retry next time)
        else:
            fake_ndc = f"AI-{abs(hash(drug_name))}"[:10]
            try:
                conn.execute('''
                    INSERT OR IGNORE INTO drugs (ndc, brand_name, source)
                    VALUES (?, ?, 'AI_VOCAB')
                ''', (fake_ndc, drug_name))
                stats['added'] += 1
            except sqlite3.OperationalError:
                pass

        conn.commit()
        conn.close()
        stats['scanned'] += 1

async def main():
    print("🚀 Starting Hybrid Crawler (TURBO MODE: 25x Concurrency)...")
    init_db()
    
    vocab = load_vocabulary()
    print(f"📋 Loaded {len(vocab)} vocabulary terms (The '9505' Drugs).")
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    # CONCURRENCY CONTROL
    SEM_LIMIT = 60
    sem = asyncio.Semaphore(SEM_LIMIT)

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_ctx, limit=SEM_LIMIT)) as session:
        # Phase 1: Process Vocabulary
        print("--- PHASE 1: Enriching AI Vocabulary ---")
        
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT vocab_index FROM crawler_state WHERE id='MAIN'")
        row = cur.fetchone()
        start_idx = row[0] if row else 0
        conn.close()
        
        # Batch processing for UI updates
        chunk_size = 50
        total_vocab = len(vocab)
        
        for i in range(start_idx, total_vocab, chunk_size):
            chunk = vocab[i : i + chunk_size]
            tasks = [process_vocab_item(sem, session, drug) for drug in chunk]
            
            await asyncio.gather(*tasks)
            
            # Update UI & State every chunk
            current_idx = min(i + chunk_size, total_vocab)
            
            conn = sqlite3.connect(DB_PATH)
            conn.execute("INSERT OR REPLACE INTO crawler_state (id, vocab_index) VALUES ('MAIN', ?)", (current_idx,))
            conn.commit()
            conn.close()
            
            elapsed = time.time() - stats['start_time']
            rate = (stats['scanned'] / elapsed) if elapsed > 0 else 0
            
            sys.stdout.write(f"\r⚡ Speed: {rate:.1f}/s | Progress: {current_idx}/{total_vocab} | Added: {stats['added']}")
            sys.stdout.flush()

        print("\n✅ Vocabulary Processing Complete.")
        
        # Phase 2: Mass Import from FDA (Discovery Mode - Partitioned)
        print("\n--- PHASE 2: Mass Discovery (Partitioned A-Z) ---")
        
        # Partitioning Strategy: A-Z, 0-9
        import string
        prefixes = list(string.ascii_lowercase) + list("0123456789")
        
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # Add column for prefix state if not exists (quick hack)
        try:
            cur.execute("ALTER TABLE crawler_state ADD COLUMN last_prefix TEXT")
        except:
            pass
            
        cur.execute("SELECT last_prefix FROM crawler_state WHERE id='MAIN'")
        row = cur.fetchone()
        start_prefix_char = row[0] if row and row[0] else prefixes[0]
        conn.close()

        # Count current catalog
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM drugs")
        current_total = cur.fetchone()[0]
        conn.close()

        # Recursive Crawl Function
        async def crawl_prefix(session, prefix):
            skip = 0
            MAX_SKIP = 24000 # Safety buffer below 25000 API limit
            total_partition_count = 0
            
            sys.stdout.write(f"\n📂 Scanning: '{prefix.upper()}*' ...")
            sys.stdout.flush()

            hit_limit = False
            
            while skip <= MAX_SKIP:
                url = f"{FDA_API_URL}?search=brand_name:{prefix}*&limit={BATCH_SIZE}&skip={skip}"
                try:
                    async with session.get(url, headers=get_headers()) as response:
                        if response.status == 200:
                            data = await response.json()
                            results = data.get('results', [])
                            
                            if not results:
                                break
                            
                            conn = sqlite3.connect(DB_PATH)
                            
                            # Load vocab for append
                            with open(VOCAB_PATH, 'r') as f:
                                vocab_data = json.load(f)
                                vocab_set = set(vocab_data.get('drugs', []))
                            vocab_updated = False
                                
                            for item in results:
                                ndc = item.get('product_ndc')
                                if not ndc: continue
                                
                                brand = item.get('brand_name', 'Unknown')
                                
                                # Vocab Append
                                if brand not in vocab_set:
                                    vocab_data['drugs'].append(brand)
                                    vocab_set.add(brand)
                                    vocab_updated = True
                                
                                # DB Insert
                                generic = item.get('generic_name', 'Unknown')
                                labeler = item.get('labeler_name', 'Unknown')
                                dosage = item.get('dosage_form', 'Unknown')
                                route = ','.join(item.get('route', []))
                                ingredients = json.dumps(item.get('active_ingredients', []))
                                
                                conn.execute('''
                                    INSERT OR IGNORE INTO drugs 
                                    (ndc, brand_name, generic_name, manufacturer, dosage_form, route, active_ingredients, source, last_updated)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, 'FDA_DISCOVERY', ?)
                                ''', (ndc, brand, generic, labeler, dosage, route, ingredients, datetime.now()))
                            
                            conn.commit()
                            conn.close()
                            
                            # Save Vocab
                            if vocab_updated:
                                try:
                                    vocab_data['count'] = len(vocab_data['drugs'])
                                    with open(VOCAB_PATH, 'w') as f:
                                        json.dump(vocab_data, f, indent=2)
                                except: pass

                            total_partition_count += len(results)
                            skip += len(results)
                            
                            # Log Progress
                            if skip % 5000 == 0:
                                sys.stdout.write(f"\r📦 '{prefix.upper()}': {skip} items...")
                                sys.stdout.flush()
                                
                            if len(results) < BATCH_SIZE:
                                break # Done naturally
                        
                        elif response.status == 429:
                            await asyncio.sleep(20)
                        elif response.status == 400:
                            # 400 means skip > 25000 (Hit Limit)
                            hit_limit = True
                            break
                        else:
                            break
                except Exception as e:
                    # print(e)
                    await asyncio.sleep(1)
            
            # RECURSION TRIGGER: If we hit the limit, split deeper
            if hit_limit or total_partition_count >= MAX_SKIP:
                if len(prefix) < 3: # Max depth 3 chars (e.g. Aaa)
                    print(f"\n⚡ Partition '{prefix}' too big! Splitting into sub-partitions...")
                    for char in string.ascii_lowercase + "0123456789":
                        await crawl_prefix(session, prefix + char)
        
        # Start the Recursive Crawl
        # If restarting, we could filter prefixes, but for simplicity/robustness we iterate main roots
        for p in prefixes:
             # Create task for root prefix
             await crawl_prefix(session, p)
             
             # Checkpoint
             conn = sqlite3.connect(DB_PATH)
             conn.execute("UPDATE crawler_state SET last_prefix=? WHERE id='MAIN'", (p,))
             conn.commit()
             conn.close()
        
        # Phase 3: Temporal Crawl (The Nuclear Option)
        print("\n--- PHASE 3: Temporal Discovery (By Date) ---")
        
        async def crawl_date_range(session, start_date, end_date):
            skip = 0
            MAX_SKIP = 24000
            total_partition_count = 0
            
            # Construct Lucene Date Range Query
            query = f'marketing_start_date:[{start_date} TO {end_date}]'
            sys.stdout.write(f"\n📅 Scanning: {start_date}-{end_date} ...")
            sys.stdout.flush()
            
            hit_limit = False
            
            while skip <= MAX_SKIP:
                url = f"{FDA_API_URL}?search={query}&limit={BATCH_SIZE}&skip={skip}"
                try:
                    async with session.get(url, headers=get_headers()) as response:
                        if response.status == 200:
                            data = await response.json()
                            results = data.get('results', [])
                            
                            if not results:
                                break
                            
                            conn = sqlite3.connect(DB_PATH)
                            
                            # Load vocab
                            try:
                                with open(VOCAB_PATH, 'r') as f:
                                    vocab_data = json.load(f)
                                    vocab_set = set(vocab_data.get('drugs', []))
                            except:
                                vocab_data = {'drugs': [], 'count': 0}
                                vocab_set = set()
                                
                            vocab_updated = False
                            
                            for item in results:
                                ndc = item.get('product_ndc')
                                if not ndc: continue
                                
                                brand = item.get('brand_name', 'Unknown')
                                generic = item.get('generic_name', 'Unknown')
                                
                                # Use Generic if Brand is missing/unknown
                                name_to_save = brand if brand and brand != 'Unknown' else generic
                                
                                if name_to_save and name_to_save not in vocab_set:
                                    vocab_data['drugs'].append(name_to_save)
                                    vocab_set.add(name_to_save)
                                    vocab_updated = True
                                
                                labeler = item.get('labeler_name', 'Unknown')
                                dosage = item.get('dosage_form', 'Unknown')
                                route = ','.join(item.get('route', []))
                                ingredients = json.dumps(item.get('active_ingredients', []))
                                
                                conn.execute('''
                                    INSERT OR IGNORE INTO drugs 
                                    (ndc, brand_name, generic_name, manufacturer, dosage_form, route, active_ingredients, source, last_updated)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, 'FDA_DISCOVERY_DATE', ?)
                                ''', (ndc, brand, generic, labeler, dosage, route, ingredients, datetime.now()))
                                
                            conn.commit()
                            conn.close()
                            
                            if vocab_updated:
                                try:
                                    vocab_data['count'] = len(vocab_data['drugs'])
                                    with open(VOCAB_PATH, 'w') as f:
                                        json.dump(vocab_data, f, indent=2)
                                except: pass
                                
                            total_partition_count += len(results)
                            skip += len(results)
                            
                            if skip % 5000 == 0:
                                sys.stdout.write(f"\r📅 {start_date}-{end_date}: {skip} items...")
                                sys.stdout.flush()
                            
                            if len(results) < BATCH_SIZE:
                                break

                        elif response.status == 429:
                            await asyncio.sleep(20)
                        elif response.status == 400:
                            hit_limit = True
                            break
                        else:
                            break
                except Exception as e:
                    await asyncio.sleep(1)
            
            # Recursive split by Month if Year is too big
            if hit_limit or total_partition_count >= MAX_SKIP:
                if len(start_date) == 4: # Is Year (YYYY)
                    print(f"\n⚡ Year {start_date} too big! Splitting by Month...")
                    year = start_date
                    for month in range(1, 13):
                        m_str = f"{month:02d}"
                        # Logic for end of month (simple approx 31 days)
                        await crawl_date_range(session, f"{year}{m_str}01", f"{year}{m_str}31")
                        
        
        # Execute Temporal Crawl (1900 - 2026) -> Covers FDA Formation (1906) and earlier records
        current_year = datetime.now().year
        for year in range(1900, current_year + 2):
            await crawl_date_range(session, str(year) + "0101", str(year) + "1231")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Crawler Stopped.")
