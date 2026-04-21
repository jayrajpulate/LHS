import psycopg2
import os
from urllib.parse import quote_plus

# Database configuration (matching Settings class)
POSTGRES_SERVER = "localhost"
POSTGRES_PORT = 5432
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = ""
POSTGRES_DB = "lhsdb"

def check_db():
    try:
        conn = psycopg2.connect(
            host=POSTGRES_SERVER,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            database=POSTGRES_DB
        )
        cur = conn.cursor()
        cur.execute("SELECT count(*) FROM tbllawyers;")
        count = cur.fetchone()[0]
        print(f"Total lawyers in DB: {count}")
        
        cur.execute("SELECT id, \"LawyerName\", \"IsPublic\" FROM tbllawyers LIMIT 5;")
        rows = cur.fetchall()
        for row in rows:
            print(row)
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
