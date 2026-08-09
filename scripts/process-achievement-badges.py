"""Build the one-badge-per-achievement Nexus image library.

On the first run the script consumes the temporary `source-by-id` PNG folder.
After that, the optimized 512px WebP files act as reproducible local masters.
"""

from pathlib import Path

from PIL import Image


GENERATED = Path(
    r"C:\Users\marco\.codex\generated_images\019fcea2-53fd-7350-94d2-cae8f44b4c9e"
)
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "achievement-art" / "badges"

HEROES = {
    "team": "exec-df5383b9-1bfb-4d81-8313-4316fab3a408.png",
    "spider": "exec-492dad9a-bc06-429e-adf0-4cec853221c9.png",
    "mutants": "exec-3d06c6aa-965a-4e1d-a750-dad45dbd67fe.png",
    "timeline": "exec-ea7e6496-6c76-4644-9703-ef3141a323c3.png",
    "street": "exec-f6bdb95b-0e7b-42b2-b3a5-83e01bedae62.png",
    "cosmic": "exec-0aefaf24-8e57-4146-9bc8-81e1d67917ca.png",
    "quartet": "exec-d143bbb0-dd41-4edb-981c-78d574e1bfa2.png",
    "mystic": "exec-0d42d142-f165-41cd-a074-d2e05d6a0bf1.png",
    "symbiote": "exec-e580ebfc-a50e-48b2-b82c-65bdbc84608d.png",
    "wakanda": "exec-6f233184-6636-4868-a8d3-3df3388281da.png",
    "scarlet": "exec-38470846-2aaf-43c1-be7a-f196b70cf256.png",
    "wolverine": "exec-e0b7d8e1-e830-49ae-96c9-35b661640b23.png",
}


def main() -> None:
    source_directory = OUTPUT / "source-by-id"
    source_files = sorted(source_directory.glob("*.png"))
    if not source_files:
        source_files = sorted((OUTPUT / "by-id" / "512").glob("*.webp"))
    if len(source_files) != 126:
        raise RuntimeError(f"Expected 126 achievement masters, found {len(source_files)}")

    for size in (256, 512):
        target = OUTPUT / "by-id" / str(size)
        target.mkdir(parents=True, exist_ok=True)
        for source in source_files:
            name = source.stem
            destination = target / f"{name}.webp"
            if source.resolve() == destination.resolve():
                continue
            with Image.open(source) as image:
                image = image.convert("RGB")
                image.thumbnail((size, size), Image.Resampling.LANCZOS)
                canvas = Image.new("RGB", (size, size), "black")
                left = (size - image.width) // 2
                top = (size - image.height) // 2
                canvas.paste(image, (left, top))
                canvas.save(destination, "WEBP", quality=86, method=6)

    index = OUTPUT.parent / "badge-index.json"
    index.write_text(
        "[\n" + ",\n".join(f'  "{source.stem}"' for source in source_files) + "\n]\n",
        encoding="utf-8",
    )

    hero_target = OUTPUT.parent / "heroes"
    hero_target.mkdir(parents=True, exist_ok=True)
    for name, source_name in HEROES.items():
        source = GENERATED / source_name
        if not source.exists():
            raise FileNotFoundError(source)
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((1600, 900), Image.Resampling.LANCZOS)
            image.save(hero_target / f"{name}.webp", "WEBP", quality=84, method=6)

    print(
        f"Built {len(source_files)} unique badge pairs and {len(HEROES)} panoramic heroes at "
        f"{OUTPUT.parent}"
    )


if __name__ == "__main__":
    main()
