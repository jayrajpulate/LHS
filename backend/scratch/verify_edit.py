import httpx
import asyncio

async def verify_edit():
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
        
        # 2. Update lawyer ID 3
        lawyer_id = 3
        print(f"Updating lawyer {lawyer_id}...")
        # Note: We send as form data
        form_data = {
            "City": "Navi Mumbai",
            "LawyerName": "Priya Deshmukh (Updated)"
        }
        r = await client.put(f"{base_url}/lawyers/admin/{lawyer_id}", data=form_data, headers=headers)
        
        if r.status_code == 200:
            updated = r.json()
            print(f"Update successful: Name='{updated['LawyerName']}', City='{updated['City']}'")
            
            # Verify it persisted
            r = await client.get(f"{base_url}/lawyers/admin/all", headers=headers)
            lawyer = next(l for l in r.json()["lawyers"] if l["id"] == lawyer_id)
            print(f"Verified in DB: Name='{lawyer['LawyerName']}', City='{lawyer['City']}'")
        else:
            print(f"Update failed: {r.status_code} {r.text}")

if __name__ == "__main__":
    asyncio.run(verify_edit())
