"""Validate the unique achievement badge set and build visual contact sheets."""

from collections import defaultdict
from hashlib import sha256
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BADGES = ROOT / "public" / "achievement-art" / "badges" / "by-id" / "256"
REVIEW = ROOT / "work" / "achievement-contact-sheets"


def average_hash(image: Image.Image) -> str:
    sample = image.convert("L").resize((16, 16), Image.Resampling.LANCZOS)
    pixels = list(sample.getdata())
    average = sum(pixels) / len(pixels)
    return "".join("1" if pixel >= average else "0" for pixel in pixels)


def main() -> None:
    files = sorted(BADGES.glob("*.webp"))
    if len(files) != 126:
        raise RuntimeError(f"Expected 126 optimized badges, found {len(files)}")

    exact: dict[str, list[str]] = defaultdict(list)
    perceptual: dict[str, list[str]] = defaultdict(list)
    for path in files:
        exact[sha256(path.read_bytes()).hexdigest()].append(path.stem)
        with Image.open(path) as image:
            perceptual[average_hash(image)].append(path.stem)

    exact_duplicates = [ids for ids in exact.values() if len(ids) > 1]
    perceptual_duplicates = [ids for ids in perceptual.values() if len(ids) > 1]
    if exact_duplicates:
        raise RuntimeError(f"Exact duplicate images detected: {exact_duplicates}")

    REVIEW.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=14)
    columns, rows, tile = 5, 5, 220
    for page, start in enumerate(range(0, len(files), columns * rows), start=1):
        canvas = Image.new("RGB", (columns * tile, rows * tile), "#090c11")
        draw = ImageDraw.Draw(canvas)
        for offset, path in enumerate(files[start : start + columns * rows]):
            column, row = offset % columns, offset // columns
            x, y = column * tile, row * tile
            with Image.open(path) as image:
                preview = image.convert("RGB").resize((176, 176), Image.Resampling.LANCZOS)
            canvas.paste(preview, (x + 22, y + 8))
            label = path.stem if len(path.stem) <= 27 else f"{path.stem[:25]}…"
            draw.text((x + 10, y + 190), label, fill="#e8edf4", font=font)
        canvas.save(REVIEW / f"achievements-{page:02d}.webp", "WEBP", quality=90, method=6)

    print(f"Validated {len(files)} unique files; exact duplicates: 0")
    print(f"Identical 16x16 average-hash groups: {len(perceptual_duplicates)}")
    print(f"Contact sheets: {len(list(REVIEW.glob('*.webp')))} at {REVIEW}")


if __name__ == "__main__":
    main()
