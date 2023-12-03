#!/usr/bin/env python
from typing import Literal
import tempfile
import zipfile
import pathlib
import shutil
import sys
import os
import re


def check_reg_ex_list(reg_ex_list: list[str], string: str) -> bool:
    for reg_ex in reg_ex_list:
        if re.search(reg_ex, string) is not None:
            return True
    return False


def create_zip(project_dir: pathlib.Path, out_path: pathlib.Path, mode: Literal["firefox", "chrome"]) -> None:
    _BLACKLIST = [r"^\.", r"\.py$", r"\.zip$", r"\.xpi$", r"\.crx$", r"\.pem$", r"^manifest\.json$", r"^manifestChrome\.json$", r"^manifestFirefox\.json$", r"^README.md$", r"^LICENSE$"]
    with zipfile.ZipFile(out_path, "w") as zf:
        for current_path in project_dir.rglob("*"):
            if current_path.is_dir():
                continue

            relative_path = current_path.relative_to(project_dir)
            if check_reg_ex_list(_BLACKLIST, relative_path.parts[0]):
                continue

            zf.write(current_path, arcname=str(relative_path))

        if mode == "firefox":
            zf.write(project_dir / "manifestFirefox.json", arcname="manifest.json")
        else:
            zf.write(project_dir / "manifestChrome.json", arcname="manifest.json")


def create_crx(project_dir: pathlib.Path) -> None:
    try:
        import crx3.creator
    except ModuleNotFoundError:
        print("crx3 not found. Install it with pip install crx3.", file=sys.stderr)
        sys.exit(1)

    if not (project_dir / "PrivateKey.pem").exists():
        print("PrivateKey.pem not found. Generating.")
        crx3.creator.create_private_key_file(project_dir / "PrivateKey.pem")

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = pathlib.Path(temp_dir)
        create_zip(project_dir, temp_path / "ChecksumCalculator.zip", "chrome")
        crx3.creator.create_crx_file(temp_path / "ChecksumCalculator.zip", project_dir / "PrivateKey.pem", project_dir / "ChecksumCalculatorChrome.crx")


def main() -> None:
    project_dir = pathlib.Path(__file__).parent

    if len(sys.argv) == 1:
        print("Usage: python build.py <firefoxUnpacked/chromeUnpacked/xpi/crx>", file=sys.stderr)
        sys.exit(1)

    match sys.argv[1].lower():
        case "firefoxunpacked":
            try:
                os.remove(project_dir / "manifest.json")
            except FileNotFoundError:
                pass

            shutil.copyfile(project_dir / "manifestFirefox.json", project_dir / "manifest.json")
        case "chromeunpacked":
            try:
                os.remove(project_dir / "manifest.json")
            except FileNotFoundError:
                pass

            shutil.copyfile(project_dir / "manifestChrome.json", project_dir / "manifest.json")
        case "xpi":
            create_zip(project_dir, project_dir / "ChecksumCalculatorFirefox.xpi", "firefox")
        case "crx":
            create_crx(project_dir)
        case _:
            print("Unknown target " + sys.argv[1], file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
