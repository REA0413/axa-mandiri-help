import requests
import json
import re
from datetime import datetime

def scrape_price():
    url = "https://axa-mandiri.co.id/laporan-keuangan-detail"
    session = requests.Session()
    
    # Headers to look like a real browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': 'https://axa-mandiri.co.id/'
    }

    try:
        print("Fetching page to find token...")
        response = session.get(url, headers=headers)
        
        # Try multiple patterns to find the token
        token_patterns = [
            r'authToken["\']\s*[:=]\s*["\']([^"\']+)["\']',
            r'p_p_auth["\']\s*[:=]\s*["\']([^"\']+)["\']',
            r'v_auth["\']\s*[:=]\s*["\']([^"\']+)["\']'
        ]
        
        token = None
        for pattern in token_patterns:
            match = re.search(pattern, response.text)
            if match:
                token = match.group(1)
                break
        
        if not token:
            # Fallback: Check for common Liferay token names
            print("Token not found in JS. Checking meta tags...")
            token = session.cookies.get('LFR_SESSION_STATE_10162') # Example cookie token

        if not token:
            # Last resort: Use your manual token to see if it still works
            token = "Nqx2KlqA" 
            print(f"Auto-detection failed. Falling back to manual token: {token}")
        else:
            print(f"Found active token: {token}")

        # Data request
        params = {
            'p_p_id': 'NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon',
            'p_p_lifecycle': '2',
            'p_p_resource_id': 'getChartData',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_authToken': token
        }

        data = {
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_daysPeriod': '7',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_fundCode': 'Mandiri Attractive Equity Money Rupiah'
        }

        api_resp = session.post(url, params=params, data=data, headers=headers)
        
        # Process data (index [0] is often wrapped in another list)
        raw_json = api_resp.json()
        data_list = raw_json[0] if isinstance(raw_json[0], list) else raw_json

        sorted_data = sorted(
            [item for item in data_list if item.get('fundCode') == 'ATRP'],
            key=lambda x: datetime.strptime(x['navDate'], '%Y-%m-%d %H:%M:%S.%f'),
            reverse=True
        )

        if sorted_data:
            latest = sorted_data[0]
            price_output = {
                'price': float(latest['bidValue']),
                'timestamp': latest['navDate']
            }
            
            with open('public/latest_price.json', 'w') as f:
                json.dump(price_output, f)
            print(f"Saved: {price_output}")
        else:
            print("No ATRP data found in response.")

    except Exception as e:
        print(f"Scraper Error: {e}")
        # We exit with 0 here so the workflow doesn't 'fail' red, 
        # but it won't push changes if it didn't find data.
        exit(0) 

if __name__ == "__main__":
    scrape_price()
