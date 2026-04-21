import httpx
import asyncio

async def debug_api():
    base_url = "http://localhost:8000/api"
    
    print("Attempting login...")
    # Common passwords to try
    passwords = ["admin123", "admin@123", "jay@123", "Test@123"]
    
    token = None
    async with httpx.AsyncClient() as client:
        for password in passwords:
            print(f"Trying password: {password}")
            try:
                r = await client.post(f"{base_url}/auth/login", data={"username": "admin", "password": password})
                if r.status_code == 200:
                    token = r.json()["access_token"]
                    print(f"Login successful with password: {password}")
                    break
                else:
                    print(f"Login failed: {r.status_code} {r.text}")
            except Exception as e:
                print(f"Login error: {e}")
        
        if token:
            print("Fetching admin lawyers...")
            headers = {"Authorization": f"Bearer {token}"}
            r = await client.get(f"{base_url}/lawyers/admin/all", headers=headers)
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                print("Data fetched successfully:")
                print(r.json())
            else:
                print(f"Error fetching lawyers: {r.text}")
        else:
            print("Failed to log in with any guessed password.")

if __name__ == "__main__":
    asyncio.run(debug_api())
