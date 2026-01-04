import requests
import sqlite3
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = "backend/sentria.db"

def test_logistics_flow():
    print("🚀 Starting Logic Verification: Orders & Shipments...")
    
    # 1. Place Order
    print("\n[1] Testing Order Creation...")
    payload = {
        "user_id": "test_user_123",
        "items": [{"id": 1, "name": "Test Drug", "price": 100, "quantity": 2}],
        "total": 350.0,
        "shipping_method": "Cold Chain Express"
    }
    
    try:
        r = requests.post(f"{BASE_URL}/logistics/order", json=payload)
        if r.status_code != 200:
            print(f"❌ Order Creation Failed: {r.text}")
            return
        
        data = r.json()
        print(f"✅ Order Created! ID: {data['order_id']}")
        print(f"   Shipment ID: {data['shipment_id']}")
        print(f"   Tracking #: {data['tracking_number']}")
        
        tracking_num = data['tracking_number']
        
        # 2. Verify Tracking Endpoint
        print(f"\n[2] Verifying Tracking Endpoint for {tracking_num}...")
        r = requests.get(f"{BASE_URL}/logistics/tracking/{tracking_num}")
        if r.status_code == 200:
            track_data = r.json()
            print(f"✅ Tracking Found! Status: {track_data['status']}, ETA: {track_data['estimated_delivery']}")
        else:
            print(f"❌ Tracking Failed: {r.text}")
            
        # 3. Verify Network Activity (Map Feed)
        print("\n[3] Verifying Network Map Feed...")
        r = requests.get(f"{BASE_URL}/logistics/network")
        if r.status_code == 200:
            network_data = r.json()
            found = any(item['tracking_number'] == tracking_num for item in network_data)
            if found:
                print(f"✅ Shipment visible in Network Feed (Map Data).")
            else:
                print(f"❌ Shipment NOT found in Network Feed.")
        else:
             print(f"❌ Network Feed Failed: {r.text}")

        # 4. Direct DB Inspection (The "Truth")
        print("\n[4] Inspecting SQLite Database...")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT * FROM orders WHERE id='{data['order_id']}'")
        order_row = cursor.fetchone()
        if order_row:
            print(f"✅ Database: Order record exists.")
        else:
            print(f"❌ Database: Order record MISSING.")
            
        cursor.execute(f"SELECT * FROM shipments WHERE tracking_number='{tracking_num}'")
        ship_row = cursor.fetchone()
        if ship_row:
            print(f"✅ Database: Shipment record exists.")
        else:
            print(f"❌ Database: Shipment record MISSING.")
        
        conn.close()

    except Exception as e:
        print(f"❌ Verification Crashed: {e}")

if __name__ == "__main__":
    test_logistics_flow()
