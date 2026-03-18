import requests
import xml.etree.ElementTree as ET
import json

def test_cricbuzz_rss():
    print('Testing Cricbuzz XML RSS fallback...')
    url = 'http://synd.cricbuzz.com/j2me/1.0/livematches.xml'
    
    try:
        r = requests.get(url, timeout=10)
        root = ET.fromstring(r.text)
        
        matches = []
        for match in root.findall('match'):
            m_state = match.find('state')
            m_status = m_state.get('status') if m_state is not None else ''
            
            # We only care about matches that are live or recently finished
            m_desc = match.get('mchDesc')
            srs = match.get('srs')
            
            # Format nicely for the frontend widget
            desc = f"{m_desc} - {srs}"
            
            teams = match.find('mscr')
            if teams is not None:
                bat = teams.find('btTm')
                bowl = teams.find('blgTm')
                
                team1_name = bat.get('sName') if bat is not None else "TBD"
                team2_name = bowl.get('sName') if bowl is not None else "TBD"
                
                inngs = getattr(bat.find('inngs'), 'get', lambda x: '') if bat is not None else lambda x: ''
                runs = inngs('r')
                wkts = inngs('wkts')
                overs = inngs('ovrs')
                
                team1_score = f"{runs}/{wkts} ({overs})" if runs else ""
                
                inngs2 = getattr(bowl.find('inngs'), 'get', lambda x: '') if bowl is not None else lambda x: ''
                runs2 = inngs2('r')
                wkts2 = inngs2('wkts')
                overs2 = inngs2('ovrs')
                team2_score = f"{runs2}/{wkts2} ({overs2})" if runs2 else ""
                
                matches.append({
                    'matchInfo': {
                        'status': m_status,
                        'matchDesc': desc,
                        'team1': {'teamName': team1_name},
                        'team2': {'teamName': team2_name}
                    },
                    'matchScore': {
                        'team1Score': {'inngs1': {'runs': team1_score}},
                        'team2Score': {'inngs1': {'runs': team2_score}}
                    }
                })
        print(f"Found {len(matches)} active matches!")
        if matches:
            print(json.dumps(matches[0], indent=2))
            
    except Exception as e:
        print('Error:', e)

test_cricbuzz_rss()
