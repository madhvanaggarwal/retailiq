import urllib.request
import json
import time

API_ENDPOINTS = [
    ("Health", "/api/health"),
    ("Executive Overview", "/api/overview"),
    ("Stores Directory", "/api/stores?page=1&page_size=20"),
    ("Store 1 Detail", "/api/stores/1"),
    ("Store 817 (High Risk)", "/api/stores/817"),
    ("Forecast Overview", "/api/forecast/overview"),
    ("Store 1 Forecast Daily", "/api/forecast/store/1?aggregation=daily"),
    ("Store 1 Forecast Weekly", "/api/forecast/store/1?aggregation=weekly"),
    ("Forecast Movers", "/api/forecast/movers"),
    ("Business Diagnosis", "/api/diagnosis"),
    ("Recommendations", "/api/recommendations"),
    ("Action Tracker List", "/api/actions"),
    ("Executive Report Deliverable", "/api/reports/executive"),
    ("Methodology & Data Quality", "/api/quality"),
]

def test_all_endpoints():
    print("\n--- 2. Auditing All Backend API Endpoints ---")
    all_passed = True
    for name, path in API_ENDPOINTS:
        url = f"http://127.0.0.1:8000{path}"
        t0 = time.time()
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                body = resp.read()
                data = json.loads(body.decode("utf-8"))
                dt_ms = (time.time() - t0) * 1000
                print(f"  [PASS] {name:<26} -> {status} OK ({dt_ms:5.1f}ms, {len(body):,} bytes)")
        except Exception as e:
            all_passed = False
            print(f"  [FAIL] {name:<26} -> ERROR: {e}")

    # Test POST endpoints
    print("\n--- 3. Testing POST Endpoints (Simulator & Consultant) ---")
    
    # What-If Simulator
    sim_url = "http://127.0.0.1:8000/api/simulator/run"
    sim_payload = json.dumps({
        "target_type": "group",
        "target_id": "Bottom 25%",
        "weeks": 4,
        "growth_rate": 0.10,
        "promo_policy": "boost_promo",
        "basket_shift": 0.05
    }).encode("utf-8")
    t0 = time.time()
    req = urllib.request.Request(sim_url, data=sim_payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        sim_data = json.loads(resp.read().decode("utf-8"))
        dt_ms = (time.time() - t0) * 1000
        print(f"  [PASS] Simulator (POST)          -> {resp.status} OK ({dt_ms:5.1f}ms, impact={sim_data['scenario_summary']['net_impact_pct']}%)")

    # Ask Consultant
    cons_url = "http://127.0.0.1:8000/api/consultant/query"
    for q in ["Explain our overall performance", "Which stores need urgent attention?", "Tell me about Store 817"]:
        cons_payload = json.dumps({"query": q}).encode("utf-8")
        t0 = time.time()
        req = urllib.request.Request(cons_url, data=cons_payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            cons_data = json.loads(resp.read().decode("utf-8"))
            dt_ms = (time.time() - t0) * 1000
            print(f"  [PASS] Consultant '{q[:20]}...' -> {resp.status} OK ({dt_ms:5.1f}ms, topic='{cons_data['topic']}')")

    return all_passed

if __name__ == "__main__":
    test_all_endpoints()
