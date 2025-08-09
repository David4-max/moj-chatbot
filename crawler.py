import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

base_url = "https://gymbeam.sk"
visited = set()
to_visit = [base_url]
max_pages = 200
delay = 1  # sekundy medzi požiadavkami

def is_valid_url(url):
    parsed = urlparse(url)
    return parsed.netloc.endswith("gymbeam.sk")

def extract_clean_text(html):
    soup = BeautifulSoup(html, "html.parser")
    # Odstránime skripty a štýly
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    # Získame čistý text
    text = soup.get_text(separator=" ", strip=True)
    return text

with open("gymbeam_data.txt", "w", encoding="utf-8") as f:
    while to_visit and len(visited) < max_pages:
        current_url = to_visit.pop(0)
        if current_url in visited:
            continue

        try:
            response = requests.get(current_url, timeout=10)
            response.raise_for_status()

            clean_text = extract_clean_text(response.text)
            visited.add(current_url)

            # Uložíme do súboru
            f.write(f"URL: {current_url}\n")
            f.write(clean_text + "\n\n---\n\n")

            print(f"Stiahnuté: {current_url}")

            soup = BeautifulSoup(response.text, "html.parser")
            for link in soup.find_all("a", href=True):
                full_url = urljoin(current_url, link["href"])
                if is_valid_url(full_url) and full_url not in visited and full_url not in to_visit:
                    to_visit.append(full_url)

            time.sleep(delay)

        except Exception as e:
            print(f"Chyba pri {current_url}: {e}")

print(f"Hotovo. Stiahnuté {len(visited)} stránok. Dáta uložené v gymbeam_data.txt")
