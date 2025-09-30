import json
import re
import os
from bs4 import BeautifulSoup

# Folder wejściowy i plik wynikowy
SOURCE_DIR = "source"
OUTPUT_FILE = "output.json"
BASE_URL = "https://www.testy.egzaminzawodowy.info/"

def clean_question_text(text: str) -> str:
    # Usuń "PYTANIE NR X."
    text = re.sub(r"PYTANIE NR\s*\d+\.", "", text, flags=re.IGNORECASE)
    # Usuń informacje o punktach
    text = re.sub(r"\(\d+\s*punktów?\s*-\s*(błędna|poprawna)\s*odp\.\)", "", text, flags=re.IGNORECASE)
    # Usuń zbędne komunikaty
    remove_phrases = [
        "www.testy.egzaminzawodowy.info",
        "Zgłoś błąd",
        "Dlaczego ta odpowiedź jest poprawna?",
        "Dodaj swoje wyjaśnienie lub komentarz.",
        "DODAJ WPIS",
        "POKAŻ / UKRYJ KOMENTARZE"
    ]
    for phrase in remove_phrases:
        text = text.replace(phrase, "")
    # Podziel po "A." i weź tylko pierwszą część (sama treść pytania)
    parts = text.split("A.")
    text = parts[0] if parts else text
    # Wyczyść białe znaki
    return text.strip()

def process_file(filepath: str):
    print(f"[INFO] Wczytywanie pliku: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    # Sprawdź tytuł strony
    title = soup.title.string.strip() if soup.title else ""
    if title != "Wyniki testu zawodowego ✍️ Kwalifikacje w Zawodzie":
        print(f"[WARNING] Plik {filepath} ma inny tytuł: {title}")

    # Znajdź główny kontener
    content_div = soup.find("div", class_="widget-content")
    if not content_div:
        print(f"[ERROR] Nie znaleziono <div class='widget-content'> w pliku {filepath}")
        return []

    questions_data = []
    answers_elements = content_div.find_all("div", class_="answers_element")
    print(f"[INFO] Znaleziono {len(answers_elements)} pytań w pliku {filepath}")

    for i, element in enumerate(answers_elements, 1):

        # --- Treść pytania ---
        cloned = element.decode_contents()
        element_clone = BeautifulSoup(cloned, "html.parser")

        # Usuń tabelę odpowiedzi i dodatkowe bloki z klona
        for tag in element_clone.find_all(["table", "div"], class_=["table_answers", "image_test"]):
            tag.decompose()
        question_text_raw = element_clone.get_text(" ", strip=True)
        question_text = clean_question_text(question_text_raw)

        # --- Tabela odpowiedzi ---
        table = element.find("table", class_="table_answers")
        table_html = ""
        if table:
            # Zamień wszystkie klasy 'error' na 'info'
            table_html = str(table).replace("error", "info")

        # --- Dodatkowa zawartość (np. obrazki) ---
        additional_content = []
        for extra in element.find_all("div", class_="image_test"):
            extra_clone = BeautifulSoup(str(extra), "html.parser")
            for img in extra_clone.find_all("img"):
                if img.has_attr("src") and not img["src"].startswith("http"):
                    img["src"] = BASE_URL + img["src"].lstrip("/")
            additional_content.append(str(extra_clone))

        questions_data.append({
            "file": os.path.basename(filepath),
            "question": question_text,
            "answers_table": table_html,
            "additional_content": additional_content
        })

    return questions_data

def main():
    all_questions = []

    if not os.path.exists(SOURCE_DIR):
        print(f"[ERROR] Folder {SOURCE_DIR} nie istnieje!")
        return

    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith(".txt") or f.endswith(".html")]
    print(f"[INFO] Znaleziono {len(files)} plików do przetworzenia.")

    for file in files:
        filepath = os.path.join(SOURCE_DIR, file)
        all_questions.extend(process_file(filepath))

    # Zapisz do JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=4)

    print(f"[INFO] Zapisano {len(all_questions)} pytań do {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
