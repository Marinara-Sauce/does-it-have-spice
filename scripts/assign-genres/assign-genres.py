import os
from dotenv import load_dotenv
import requests
from supabase import create_client, Client

# Load environment variables from a .env file (optional)
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# OpenLibrary search URL
OPENLIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPENLIBRARY_WORKS_URL = "https://openlibrary.org"

def fetch_books(supabase: Client):
    response = supabase.table("books").select("id, title, author").execute()
    return response.data if response.data else []

def fetch_genre_ids(supabase: Client):
    response = supabase.table("genres").select("id, genre").execute()
    return {genre['genre'].lower(): genre['id'] for genre in response.data} if response.data else {}

def search_openlibrary(title, author):
    params = {"title": title, "author": author, "limit": 1}
    response = requests.get(OPENLIBRARY_SEARCH_URL, params=params)
    if response.status_code != 200:
        return []
    data = response.json()
    if "docs" in data and data["docs"]:
        work_key = data["docs"][0].get("key")
        if work_key:
            return fetch_subjects_from_work(work_key)
    return []

def fetch_subjects_from_work(work_key):
    url = f"{OPENLIBRARY_WORKS_URL}{work_key}.json"
    response = requests.get(url)
    if response.status_code != 200:
        return []
    data = response.json()
    return data.get("subjects", [])

def insert_book_genre(supabase: Client, book_id, genre_id):
    try:
        supabase.table("book_to_genres").insert({"book_id": book_id, "genre_id": genre_id}).execute()
    except Exception as e:
        if "duplicate key value" in str(e):
            pass  # Ignore unique constraint violation
        else:
            raise e

def main():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    books = fetch_books(supabase)
    genre_map = fetch_genre_ids(supabase)

    for book in books:
        book_id = book['id']
        title = book['title']
        author = book['author']
        print(f"Processing: {title} by {author}")

        subjects = search_openlibrary(title, author)

        for subject in subjects:
            genre_id = genre_map.get(subject.lower())
            if genre_id:
                insert_book_genre(supabase, book_id, genre_id)

if __name__ == "__main__":
    main()
