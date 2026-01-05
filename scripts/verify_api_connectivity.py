import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_memory_persistence():
    print(f"Testing Memory Persistence at {BASE_URL}...")
    
    key = "test_persistence_key"
    value = {"test": "data", "timestamp": 12345}
    
    # 1. SET
    print(f"1. Setting Key: {key}")
    try:
        response = requests.post(f"{BASE_URL}/memory/set", json={"key": key, "value": value})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        if response.status_code != 200:
            print("❌ SET Failed")
            return False
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False

    # 2. GET
    print(f"2. Getting Key: {key}")
    try:
        response = requests.get(f"{BASE_URL}/memory/get/{key}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        data = response.json()
        if data == value:
            print("✅ Data Match! Persistence Works.")
            return True
        else:
            print(f"❌ Data Mismatch. Expected {value}, got {data}")
            return False
    except Exception as e:
        print(f"❌ GET Failed: {e}")
        return False

if __name__ == "__main__":
    success = test_memory_persistence()
    sys.exit(0 if success else 1)
