import requests
import csv

# Define a threshold for "substantial" number of books
MIN_WORK_COUNT = 500

# OpenLibrary subject search endpoint
SUBJECTS_API_URL = "https://openlibrary.org/subjects/fiction.json"

def fetch_subjects():
    subjects = []
    response = requests.get(SUBJECTS_API_URL)
    if response.status_code != 200:
        print(f"Failed to fetch subjects: {response.status_code}")
        return subjects
    
    data = response.json()
    
    works = data.get("works", [])
    for work in works:
        bookSubjects = work.get("subject", [])
        for subject in bookSubjects:
            if ',' in subject:
                # Split by comma and strip whitespace
                sub_subjects = [sub.strip().lower() for sub in subject.split(",")]
                for sub_subject in sub_subjects:
                    if sub_subject not in subjects:
                        subjects.append(sub_subject)
            elif subject not in subjects:
                subjects.append(subject.lower())

    return subjects

def save_subjects_to_csv(subjects, filename="genres.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["genre"])
        for genre in subjects:
            writer.writerow([genre])

def main():
    print("Fetching genres from OpenLibrary...")
    subjects = fetch_subjects()
    
    # Remove duplicates
    subjects = list(set(subjects))
    
    print(f"Fetched {len(subjects)} unique genres.")
    print("Saving to CSV...")
    save_subjects_to_csv(subjects)
    print("Done.")

if __name__ == "__main__":
    main()
