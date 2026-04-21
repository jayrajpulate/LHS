import httpx
import asyncio

async def verify_detail_api():
    base_url = "http://localhost:8000/api"
    username = "admin"
    password = "admin123"
    
    async with httpx.AsyncClient() as client:
        # 1. Login
        r = await client.post(f"{base_url}/auth/login", data={"username": username, "password": password})
        if r.status_code != 200:
            print("Login failed")
            return
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Fetch lawyer ID 3
        lawyer_id = 3
        print(f"Fetching details for lawyer {lawyer_id}...")
        r = await client.get(f"{base_url}/lawyers/admin/{lawyer_id}", headers=headers)
        
        if r.status_code == 200:
            lawyer = r.json()
            print(f"Fetch successful: Name='{lawyer['LawyerName']}', ID={lawyer['id']}")
        else:
            print(f"Fetch failed: {r.status_code} {r.text}")

if __name__ == "__main__":
    asyncio.run(verify_detail_api())
