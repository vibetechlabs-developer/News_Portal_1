import requests
import json
import re

def parse_cricbuzz():
    print('Testing robust cricbuzz regex...')
    url = 'https://www.cricbuzz.com/api/cricket-match/matches'
    # Fallback to an API that offers free JSON but maybe requires scraping if public
    # Often /match/live-scores has JSON blobs in the initial script
    url = 'https://www.cricbuzz.com/cricket-match/live-scores'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    r = requests.get(url, headers=headers)
    
    # Cricbuzz embeds its initial data in a variable window.__INITIAL_STATE__
    match = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?});', r.text)
    if match:
        try:
            data = json.loads(match.group(1))
            print('Found initial state!')
            # Let's extract matches
            matches = []
            if 'match' in data and 'matches' in data['match']:
                for m_id, m_data in data['match']['matches'].items():
                    if m_data.get('state') == 'INPROGRESS' or m_data.get('state') == 'STUMP':
                        matches.append(m_data)
            print('Active matches found:', len(matches))
        except Exception as e:
            print('Failed to parse:', e)
    else:
        print('Did not find initial state')

parse_cricbuzz()
