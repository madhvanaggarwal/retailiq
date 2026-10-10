import urllib.request
import re
import json

def test_frontend_assets():
    print("--- 1. Testing Frontend HTML & Assets ---")
    resp = urllib.request.urlopen("http://127.0.0.1:8000/")
    assert resp.status == 200, f"Root returned status {resp.status}"
    html = resp.read().decode("utf-8")
    print(f"[OK] Root HTML returned 200 OK (size {len(html)} bytes)")

    assets = re.findall(r'(?:href|src)="(/assets/[^"]+)"', html)
    print(f"Discovered {len(assets)} assets in index.html:")
    for a in assets:
        url = f"http://127.0.0.1:8000{a}"
        a_resp = urllib.request.urlopen(url)
        content = a_resp.read()
        ctype = a_resp.headers.get("Content-Type")
        assert a_resp.status == 200, f"Asset {a} returned {a_resp.status}"
        assert len(content) > 0, f"Asset {a} is empty"
        print(f"  [OK] {a} -> 200 OK ({ctype}, {len(content):,} bytes)")

if __name__ == "__main__":
    test_frontend_assets()
