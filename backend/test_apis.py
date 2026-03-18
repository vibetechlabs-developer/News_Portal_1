import requests

def test_yahoo():
    print('Testing Yahoo Finance...')
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    url = 'https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d'
    try:
        r = requests.get(url, headers=headers)
        print('Yahoo Status:', r.status_code)
        if r.status_code == 200:
            print('Yahoo Data Snippet:', str(r.json())[:100] + '...')
    except Exception as e:
        print('Yahoo Error:', e)

def test_cricket():
    print('\nTesting Smart Cricket Scraper (NDTV/ESPNcricinfo RSS)...')
    # Because free cricket APIs require signups that rate limit, let's use public RSS or a known free endpoint.
    url = 'https://sports.ndtv.com/cricket/live-scores'
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        print('Cricket Source Status:', r.status_code)
    except Exception as e:
        print('Cricket Error:', e)

if __name__ == '__main__':
    test_yahoo()
    test_cricket()
