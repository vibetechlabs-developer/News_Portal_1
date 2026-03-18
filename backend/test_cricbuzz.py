import requests
from bs4 import BeautifulSoup
import json

def scrape_cricbuzz():
    print('Testing Cricbuzz Scraper...')
    url = 'https://www.cricbuzz.com/cricket-match/live-scores'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    matches = []
    blocks = soup.find_all('div', class_='cb-mtch-lst')
    for block in blocks:
        try:
            status_elem = block.find('div', class_='cb-text-live') or block.find('div', class_='cb-text-complete')
            status = status_elem.text.strip() if status_elem else 'Unknown'
            
            teams_wrap = block.find('div', class_='cb-hm-scg-bat-srfc')
            team1_elem = teams_wrap.find('div', class_='cb-hm-scg-tm-nm') if teams_wrap else None
            team1_score_elem = teams_wrap.find('div', class_='cb-hm-scg-tm-nm').find_next_sibling('div') if team1_elem else None
            
            teams_wrap_bowl = block.find('div', class_='cb-hm-scg-bwl-srfc')
            team2_elem = teams_wrap_bowl.find('div', class_='cb-hm-scg-tm-nm') if teams_wrap_bowl else None
            team2_score_elem = teams_wrap_bowl.find('div', class_='cb-hm-scg-tm-nm').find_next_sibling('div') if team2_elem else None

            match_info = block.find('div', class_='text-gray').text.strip() if block.find('div', class_='text-gray') else 'Live Match'
            
            matches.append({
                'matchInfo': {
                    'status': status,
                    'matchDesc': match_info,
                    'team1': {'teamName': team1_elem.text.strip() if team1_elem else ''},
                    'team2': {'teamName': team2_elem.text.strip() if team2_elem else ''}
                },
                'matchScore': {
                    'team1Score': {'inngs1': {'runs': team1_score_elem.text.strip() if team1_score_elem else ''}},
                    'team2Score': {'inngs1': {'runs': team2_score_elem.text.strip() if team2_score_elem else ''}}
                }
            })
        except Exception as e:
            pass
            
    print('Matches found:', len(matches))
    if matches:
        print(json.dumps(matches[0], indent=2))

scrape_cricbuzz()
