import requests
from bs4 import BeautifulSoup
import json

def scrape_ndtv_cricket():
    print('Scraping NDTV Sports for Live Cricket Updates...')
    url = 'https://sports.ndtv.com/cricket/live-scores'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    try:
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            print('Failed to fetch NDTV')
            return
            
        soup = BeautifulSoup(r.text, 'html.parser')
        
        matches = []
        
        # NDTV list structure
        match_lists = soup.find_all('div', class_='scr_mtc')
        for m in match_lists:
            status_elem = m.find('div', class_='scr_mtc-stt')
            status = status_elem.text.strip() if status_elem else ''
            
            teams = m.find_all('div', class_='scr_tm-wrp')
            if len(teams) >= 2:
                team1_name = teams[0].find('div', class_='scr_tm-nm').text.strip()
                team1_score_elem = teams[0].find('span', class_='scr_tm-run')
                team1_score = team1_score_elem.text.strip() if team1_score_elem else ''
                
                team2_name = teams[1].find('div', class_='scr_tm-nm').text.strip()
                team2_score_elem = teams[1].find('span', class_='scr_tm-run')
                team2_score = team2_score_elem.text.strip() if team2_score_elem else ''
                
                info_elem = m.find('div', class_='scr_mtcInfo')
                match_info = info_elem.text.strip() if info_elem else ''
                
                matches.append({
                    'status': status,
                    'matchDesc': match_info,
                    'team1': {'teamName': team1_name},
                    'team2': {'teamName': team2_name},
                    'team1Score': {'inngs1': {'runs': team1_score}},
                    'team2Score': {'inngs1': {'runs': team2_score}}
                })
                
        print(json.dumps({'typeMatches': [{'seriesMatches': [{'seriesAdWrapper': {'matches': matches}}]}]}, indent=2))
        
    except Exception as e:
        print('Error:', e)

scrape_ndtv_cricket()
