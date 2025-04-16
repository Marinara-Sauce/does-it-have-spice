import random
import openai
import requests
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables from a .env file (optional)
load_dotenv()

# === CONFIG ===
openai.api_key = os.environ.get("OPEN_AI_KEY")

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# === SMUT ANALYSIS PROMPT ===
def analyze_smut(book_title):
    prompt = f"""
Characterize the book "{book_title}" into one of the 4 categories based off of the "smut level" of the book

 - None: Nothing
 - Mild: Implied or "Closed Door"
 - Moderate: One or more instances of sexual content
 - Explicit: Repeated or highlighted instances of sexual content with explicit details or descriptions

Output in this format:

Smut Level: <None/Mild/Moderate/Explicit>
Hot Zones: A comma seperated list in this format: Chapter X-Y - Pages Y-Z (or say "Unknown")
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    return response.choices[0].message['content']

# === FETCH BOOKS ===
def is_book_already_in_db(title):
    result = supabase.table("unique_books").select("title").eq("title", title).limit(1).execute()
    return len(result.data) > 0

def fetch_books(subject="romance", limit=5):
    """
    Fetch a random list of trending books from a subject/genre using Open Library Search API.
    """
    max_pages = 20  # You can adjust this higher to explore more books
    page = random.randint(1, max_pages)
    
    print(f"📚 Fetching page {page} of results for subject '{subject}'...")
    
    url = f"https://openlibrary.org/search.json?subject={subject}&language=eng&page={page}&limit={limit}"
    response = requests.get(url)
    data = response.json()
    docs = data.get("docs", [])

    # Normalize result to match existing structure
    books = []
    for doc in docs:
        books.append({
            "title": doc.get("title"),
            "description": doc.get("first_sentence", {}).get("value", "") if isinstance(doc.get("first_sentence"), dict) else doc.get("first_sentence", ""),
            "authors": [{"name": doc.get("author_name", ["Unknown"])[0]}],
            "subject": doc.get("subject", []),
            "cover_edition_key": doc.get("cover_edition_key", None),
        })

    return books

# === PARSE RESPONSE ===
def parse_response(response):
    lines = response.splitlines()
    level = "Unknown"
    zones = "Unknown"
    for line in lines:
        if line.lower().startswith("smut level:"):
            level = line.split(":")[1].strip()
        elif line.lower().startswith("hot zones:"):
            zones = line.split(":")[1].strip()
    return level, zones

# === INSERT INTO SUPABASE ===
def insert_into_supabase(title, author, genre_list, isbn, smut_level, specific_locations):
    genre = ", ".join(genre_list[:3]) if genre_list else "Unknown"
    isbn = isbn or None
    
    if specific_locations == "Unknown":
        specific_locations = None
    
    result = supabase.table("books").insert({
        "title": title,
        "author": author,
        "genre": genre,
        "isbn": isbn,
        "smut_level": smut_level,
        "specific_locations": specific_locations,
        "created_by": "e5f65718-48e6-410b-9bc3-05e632b86042"
    }).execute()
    print("✅ Uploaded to Supabase:", result.data)

# === MAIN ===
def main(subject="manga", count=100):
    all_books = fetch_books(subject, limit=200)
    added = 0
    attempts = 0
    max_attempts = len(all_books)

    while added < count and attempts < max_attempts:
        book = all_books[attempts]
        attempts += 1

        title = book.get("title")
        
        # NEW: Get author
        authors = book.get("authors", [])
        author = authors[0]['name'] if authors else "Unknown"

        # NEW: Get genre/subject tags
        genres = book.get("subject", [])[:3]  # top 3

        # NEW: Get ISBN
        isbn = "Unknown"
        if "cover_edition_key" in book:
            olid = book["cover_edition_key"]
            edition_url = f"https://openlibrary.org/api/books?bibkeys=OLID:{olid}&format=json&jscmd=data"
            try:
                edition_data = requests.get(edition_url).json()
                edition_info = edition_data.get(f"OLID:{olid}", {})
                identifiers = edition_info.get("identifiers", {})
                isbn_list = identifiers.get("isbn_13") or identifiers.get("isbn_10")
                if isbn_list:
                    isbn = isbn_list[0]
            except Exception:
                pass

            # Skip duplicates
            if is_book_already_in_db(title):
                print(f"🔁 Skipping already processed book: {title}")
                continue

            print(f"\n📘 Analyzing '{title}'...")
            try:
                response = analyze_smut(title)
                print("📝 GPT Response:", response)
                smut_level, hot_zones = parse_response(response)
                insert_into_supabase(title, author, genres, isbn, smut_level.lower(), hot_zones)
                added += 1
            except Exception as e:
                print("❌ Error analyzing or uploading:", e)

            if added < count:
                print(f"\n⚠️ Only {added} unique books analyzed after {attempts} attempts.")

if __name__ == "__main__":
    # books = fetch_books("romance", 5)
    # print(books)
    main()
