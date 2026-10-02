from pathlib import Path

HTML = Path("index.html")
html = HTML.read_text(encoding="utf-8")

if "favicon.svg" in html:
    print("Already linked ? nothing to do")
else:
    anchor = "<title>zahid.os</title>"
    link = anchor + "\n" + '<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
    if anchor in html:
        html = html.replace(anchor, link, 1)
        HTML.write_text(html, encoding="utf-8")
        print("Added favicon link after <title>")
    else:
        print("WARN: title tag not found")

print(f"index.html now: {len(html)} bytes")
