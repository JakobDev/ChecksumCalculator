import requests
import shutil
import os


THIRD_PARTY = [
    ("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js", "crypto-js/crypto-js.min.js"),
    ("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css", "toastify-js/toastify.min.css"),
    ("https://cdn.jsdelivr.net/npm/toastify-js", "toastify-js/toastify-js.js"),
    ("https://www.w3schools.com/w3css/4/w3.css", "w3css/w3.css")
]


def download_file(url: str, path: str) -> None:
    r = requests.get(url)

    try:
        os.makedirs(os.path.dirname(path))
    except Exception:
        pass

    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(r.text)


def main() -> None:
    current_dir = os.path.dirname(__file__)

    shutil.rmtree(os.path.join(current_dir, "3rdParty"))

    for i in THIRD_PARTY:
        download_file(i[0], os.path.join(current_dir, "3rdParty", i[1]))


if __name__ == "__main__":
    main()