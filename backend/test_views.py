import sys
import importlib.util
import os

# To test the Django view directly without spinning up the server, let's just run the code locally as a function
import requests
from bs4 import BeautifulSoup

def test_cricket():
    print('--- CRICKET NEWS PROXY TEST ---')
    url = 'https://sports.ndtv.com/cricket/live-scores'
    resp = requests.get(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"},
        timeout=10,
    )
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    matches = []
    match_lists = soup.find_all('div', class_='scr_mtc')
    
    for m in match_lists:
        status_elem = m.find('div', class_='scr_mtc-stt')
        status_text = status_elem.text.strip() if status_elem else 'Live'
        info_elem = m.find('div', class_='scr_mtcInfo')
        match_info = info_elem.text.strip() if info_elem else 'Cricket Match'

        teams = m.find_all('div', class_='scr_tm-wrp')
        t1, s1, t2, s2 = "TBD", "", "TBD", ""
        if len(teams) >= 2:
            t1_nm = teams[0].find('div', class_='scr_tm-nm')
            t1 = t1_nm.text.strip() if t1_nm else "TBD"
            t1_sc = teams[0].find('span', class_='scr_tm-run')
            s1 = t1_sc.text.strip() if t1_sc else ""
            t2_nm = teams[1].find('div', class_='scr_tm-nm')
            t2 = t2_nm.text.strip() if t2_nm else "TBD"
            t2_sc = teams[1].find('span', class_='scr_tm-run')
            s2 = t2_sc.text.strip() if t2_sc else ""

        matches.append({
            "story": {
                "headline": match_info,
                "intro": f"{t1} {s1} vs {t2} {s2} ({status_text})",
            }
        })
    import json
    print(json.dumps({"storyList": matches}, indent=2))

def test_market():
    print('\n--- MARKET INDICES PROXY TEST ---')
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
    url = "https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d"
    r = requests.get(url, headers=headers)
    print("Status:", r.status_code)
    try:
        data = r.json()
        price = data['chart']['result'][0]['meta']['regularMarketPrice']
        print(f"NIFTY 50 Price: {price}")
    except Exception as e:
        print("Error parsing Yahoo API:", e)

if __name__ == '__main__':
    test_cricket()
    test_market()
