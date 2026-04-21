import psycopg2

def check_lawyers():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="jay@123",
            database="lhsdb"
        )
        cur = conn.cursor()
        cur.execute("SELECT id, \"LawyerName\", \"LawyerEmail\", \"IsPublic\" FROM tbllawyers;")
        rows = cur.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Public: {row[3]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_lawyers()
