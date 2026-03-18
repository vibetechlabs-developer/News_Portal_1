import requests

def test_cricketdata():
    print('Testing CricketData.org API...')
    # This API provides a very generous free tier (100 hits per day, 10,000 per month). 
    # For a news portal widget that just shows top 3-4 matches, caching the response for 5 mins helps.
    api_key = 'demo'  # They provide a demo key for basic testing
    url = f'https://api.cricapi.com/v1/currentMatches?apikey=a5ee9e9c-1087-43ca-a0f2-e570ee6eb9b3&offset=0'
    
    # Try fetching with their test token
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        print('Status:', data.get('status'))
        if data.get('data'):
            print('Found matches:', len(data['data']))
            print(data['data'][0])
    except Exception as e:
        print('Error:', e)

test_cricketdata()
