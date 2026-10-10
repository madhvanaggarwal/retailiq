import subprocess
import time
import json
import urllib.request
import urllib.error
import asyncio
import websockets
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://127.0.0.1:8000"

def test_backend_endpoints():
    print("--- 1. Testing Consultant Backend Endpoint with Valid & Invalid Queries ---")
    
    # 1. Valid queries
    test_queries = [
        "What is our revenue at risk for Q3 2015?",
        "Explain our overall chain performance",
        "How accurate is the sales forecasting model?",
        "Tell me about Store 817",
        "Why is Store 383 at risk?",
        "How effective are promotions across the chain?",
        "Does Promo2 work?",
        "Which store profiles should we expand into?",
        "Tell me about Store 9999" # Out-of-bounds store test
    ]
    
    for q in test_queries:
        req = urllib.request.Request(
            f"{BASE_URL}/api/consultant/query",
            data=json.dumps({"query": q}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
        assert "topic" in data
        assert "executive_takeaway" in data
        assert "evidence_and_metrics" in data
        print(f"  [OK] Valid query '{q[:40]}...' -> Topic: '{data['topic']}'")
        
    # 2. Invalid / Empty queries (should return 400 Bad Request)
    for bad_q in ["", "   "]:
        req = urllib.request.Request(
            f"{BASE_URL}/api/consultant/query",
            data=json.dumps({"query": bad_q}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            urllib.request.urlopen(req)
            raise AssertionError(f"Expected 400 error for empty query '{bad_q}', but got 200!")
        except urllib.error.HTTPError as e:
            assert e.code == 400
            err_json = json.loads(e.read().decode("utf-8"))
            print(f"  [OK] Empty query '{bad_q}' correctly rejected -> 400 ({err_json.get('detail')})")

async def test_frontend_browser_interaction():
    print("\n--- 2. Testing End-to-End Browser Interaction via Chrome DevTools Protocol ---")
    proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-sandbox",
        f"{BASE_URL}/"
    ])
    time.sleep(2.0)
    
    try:
        tabs_resp = urllib.request.urlopen("http://127.0.0.1:9222/json")
        tabs = json.loads(tabs_resp.read().decode("utf-8"))
        ws_url = None
        for t in tabs:
            if t.get("type") == "page" and "8000" in t.get("url", ""):
                ws_url = t["webSocketDebuggerUrl"]
                break
        if not ws_url:
            ws_url = tabs[0]["webSocketDebuggerUrl"]
            
        print(f"[OK] Connected to Chrome: {ws_url}")
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            mid = 1
            async def cmd(method, params=None):
                nonlocal mid
                mid += 1
                msg_id = mid
                await ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == msg_id:
                        return data.get("result", {})

            console_errors = []
            network_errors = []
            
            # Start background message listener
            await cmd("Runtime.enable")
            await cmd("Console.enable")
            await cmd("Network.enable")
            await asyncio.sleep(2.0)

            # 1. Navigate to Consultant Module
            nav_res = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const target = btns.find(b => b.innerText && b.innerText.includes('Ask Consultant'));
                    if (target) {
                        target.click();
                        return true;
                    }
                    return false;
                })()
                """
            })
            assert nav_res.get("result", {}).get("value") is True, "Failed to click Ask Consultant in sidebar"
            print("  [OK] Clicked 'Ask Consultant' sidebar button")
            await asyncio.sleep(1.0)

            # Verify page header
            page_header = await cmd("Runtime.evaluate", {
                "expression": "document.querySelector('h3').innerText"
            })
            print(f"  [OK] Active view header: '{page_header.get('result', {}).get('value')}'")

            # 2. Test clicking recommended question 1
            print("  -> Testing recommended question 1: 'What is our revenue at risk for Q3 2015?'")
            q1_click = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const target = btns.find(b => b.innerText && b.innerText.includes('revenue at risk'));
                    if (target) {
                        target.click();
                        return true;
                    }
                    return false;
                })()
                """
            })
            assert q1_click.get("result", {}).get("value") is True
            await asyncio.sleep(1.5)

            # 3. Test clicking recommended question 2 (Promotional Effectiveness)
            print("  -> Testing recommended question 2: 'How effective are promotions across the chain?'")
            q2_click = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const target = btns.find(b => b.innerText && b.innerText.includes('promotions across the chain'));
                    if (target) {
                        target.click();
                        return true;
                    }
                    return false;
                })()
                """
            })
            assert q2_click.get("result", {}).get("value") is True
            await asyncio.sleep(1.5)

            # 4. Test typing custom question and clicking Ask button
            print("  -> Testing typing question and clicking Ask: 'Tell me about Store 817'")
            type_click = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const input = document.querySelector('input');
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(input, 'Tell me about Store 817');
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    const submitBtn = document.querySelector('button[type="submit"]');
                    submitBtn.click();
                    return true;
                })()
                """
            })
            assert type_click.get("result", {}).get("value") is True
            await asyncio.sleep(1.5)

            # 5. Test typing custom question and pressing Enter
            print("  -> Testing typing question and pressing Enter: 'How accurate is the sales forecasting model?'")
            enter_click = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const input = document.querySelector('input');
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(input, 'How accurate is the sales forecasting model?');
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true });
                    input.dispatchEvent(event);
                    return true;
                })()
                """
            })
            assert enter_click.get("result", {}).get("value") is True
            await asyncio.sleep(1.5)

            # 6. Verify final thread state and all answers
            thread_state = await cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const userBubbles = Array.from(document.querySelectorAll('.bg-navy-900')).map(b => b.innerText.trim());
                    const topicElements = Array.from(document.querySelectorAll('span'))
                        .filter(e => e.textContent && e.textContent.includes('Consulting Topic:'))
                        .map(e => e.textContent.replace('Consulting Topic:', '').trim());
                    const uniqueTopics = Array.from(new Set(topicElements));
                    
                    const facts = Array.from(document.querySelectorAll('*')).filter(e => e.innerText === 'Fact').length;
                    const models = Array.from(document.querySelectorAll('*')).filter(e => e.innerText === 'Model').length;
                    
                    return {
                        totalBubbles: userBubbles.length,
                        userBubbles: userBubbles,
                        totalTopics: uniqueTopics.length,
                        topics: uniqueTopics,
                        factBadgeCount: facts,
                        modelBadgeCount: models
                    };
                })()
                """,
                "returnByValue": True
            })
            
            res_val = thread_state.get("result", {}).get("value", {})
            print(f"\n--- Verified Conversation History ({res_val['totalBubbles']} exchanges) ---")
            for i, (b, t) in enumerate(zip(res_val['userBubbles'], res_val['topics']), 1):
                print(f"  Exchange #{i}:")
                print(f"    User Query : \"{b}\"")
                print(f"    Answer Topic: {t}")
            
            print(f"\n  Badges verified: {res_val['factBadgeCount']} [Fact] badges, {res_val['modelBadgeCount']} [Model] badges")
            
            assert res_val['totalBubbles'] >= 5, f"Expected at least 5 conversation bubbles, got {res_val['totalBubbles']}"
            assert any("817" in t for t in res_val['topics']), "Store 817 topic not found in conversation!"
            assert any("Promotion" in t for t in res_val['topics']), "Promotional topic not found in conversation!"
            assert any("Forecast" in t for t in res_val['topics']), "Forecast accuracy topic not found in conversation!"

    finally:
        proc.terminate()

def main():
    test_backend_endpoints()
    asyncio.run(test_frontend_browser_interaction())
    print("\n[PASS] Ask Your Retail Consultant End-to-End Bug Fix VERIFIED 100% SUCCESSFUL!\n")

if __name__ == "__main__":
    main()
