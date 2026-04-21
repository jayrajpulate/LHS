import psycopg2
import os

def get_admins():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="jay@123",
            database="lhsdb"
        )
        cur = conn.cursor()
        cur.execute("SELECT \"AdminuserName\", \"Password\", \"Email\" FROM tbladmin;")
        rows = cur.fetchall()
        for row in rows:
            print(f"Username: {row[0]}, Password: {row[1]}, Email: {row[2]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_admins()
