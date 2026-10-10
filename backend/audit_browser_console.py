import subprocess
import time
import json
import urllib.request
import asyncio
import websockets
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def audit_chrome():
    print("--- 4. Auditing Browser Console, JavaScript Runtime & Network ---")
    
    # 1. Start headless Chrome with remote debugging
    proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ])
    
    time.sleep(1.5)
    
    try:
        # 2. Get WebSocket debugger URL
        tabs_resp = urllib.request.urlopen("http://127.0.0.1:9222/json")
        tabs = json.loads(tabs_resp.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"[OK] Connected to Chrome DevTools Protocol: {ws_url}")
        
        async with websockets.connect(ws_url) as ws:
            # Enable Console, Runtime, Page, Network
            await ws.send(json.dumps({"id": 1, "method": "Console.enable"}))
            await ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
            await ws.send(json.dumps({"id": 3, "method": "Page.enable"}))
            await ws.send(json.dumps({"id": 4, "method": "Network.enable"}))
            
            # Navigate to RetailIQ
            await ws.send(json.dumps({
                "id": 5,
                "method": "Page.navigate",
                "params": {"url": "http://127.0.0.1:8000/"}
            }))
            
            console_errors = []
            runtime_exceptions = []
            network_failures = []
            request_urls = {}
            
            # Listen for 5 seconds
            end_time = time.time() + 5.0
            while time.time() < end_time:
                try:
                    msg_str = await asyncio.wait_for(ws.recv(), timeout=1.0)
                    msg = json.loads(msg_str)
                    method = msg.get("method")
                    
                    if method == "Network.requestWillBeSent":
                        req = msg["params"]
                        request_urls[req["requestId"]] = req["request"]["url"]
                    
                    if method == "Console.messageAdded":
                        m = msg["params"]["message"]
                        level = m.get("level")
                        text = m.get("text", "")
                        if level in ["error", "warning"]:
                            console_errors.append(f"[{level.upper()}] {text}")
                            
                    elif method == "Runtime.exceptionThrown":
                        details = msg["params"]["exceptionDetails"]
                        runtime_exceptions.append(details.get("text", "") + " " + str(details.get("exception", {})))
                        
                    elif method == "Network.loadingFailed":
                        params = msg["params"]
                        req_id = params.get('requestId')
                        err_text = params.get('errorText')
                        url = request_urls.get(req_id, 'unknown')
                        # Ignore initial about:blank replacement abort
                        if url == 'unknown' and err_text == 'net::ERR_ABORTED' and params.get('type') == 'Document':
                            continue
                        network_failures.append(f"Request failed: {url} -> {err_text} (type={params.get('type')})")
                        
                except asyncio.TimeoutError:
                    pass
            
            print(f"\n--- Audit Results ---")
            print(f"Runtime JavaScript Exceptions: {len(runtime_exceptions)}")
            for exc in runtime_exceptions:
                print(f"  [ERROR] {exc}")
                
            print(f"Network Failures: {len(network_failures)}")
            for nf in network_failures:
                print(f"  [ERROR] {nf}")
                
            print(f"Console Errors/Warnings: {len(console_errors)}")
            for ce in console_errors:
                print(f"  {ce}")
                
            assert len(runtime_exceptions) == 0, f"Found {len(runtime_exceptions)} runtime exceptions"
            assert len(network_failures) == 0, f"Found {len(network_failures)} network failures"
            print("\n[PASS] ZERO Runtime Exceptions, ZERO Network Failures. Web application loads flawlessly in Chrome!")
            
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(audit_chrome())
