import requests
import json
import re
from datetime import datetime

def scrape_price():
    url = "https://axa-mandiri.co.id/laporan-keuangan-detail"
    session = requests.Session() # Uses a session to keep cookies consistent
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }

    try:
        # 1. Visit the page to get a fresh session/cookies and find the token
        print("Fetching fresh token...")
        main_page = session.get(url, headers=headers)
        token_match = re.search(r'authToken["\']\s*:\s*["\']([^"\']+)["\']', main_page.text)
        
        if not token_match:
            raise Exception("Could not find authToken in page source.")
        
        token = token_match.group(1)
        print(f"Found token: {token}")

        # 2. Prepare the POST request
        params = {
            'p_p_id': 'NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon',
            'p_p_lifecycle': '2',
            'p_p_resource_id': 'getChartData',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_authToken': token
        }

        data = {
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_daysPeriod': '7', # Get 7 days to ensure we have data
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_fundCode': 'Mandiri Attractive Equity Money Rupiah'
        }

        # 3. Request the data
        response = session.post(url, params=params, data=data, headers=headers)
        response_data = response.json()

        if not response_data or len(response_data) == 0:
            raise Exception("Server returned an empty list. The token might be invalid or restricted.")

        # 4. Process the list
        data_list = response_data[0]
        
        # Filter for the correct fund and sort by date
        sorted_data = sorted(
            [item for item in data_list if item.get('fundCode') == 'ATRP'],
            key=lambda x: datetime.strptime(x['navDate'], '%Y-%m-%d %H:%M:%S.%f'),
            reverse=True
        )

        if sorted_data:
            latest = sorted_data[0]
            price_data = {
                'price': float(latest['bidValue']),
                'timestamp': latest['navDate']
            }
            
            with open('public/latest_price.json', 'w') as f:
                json.dump(price_data, f)
            print(f"Successfully saved: {price_data}")
        else:
            print("Fund code ATRP not found in results.")

    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1) # Force the GitHub Action to show as 'Failed' if scraping fails

if __name__ == "__main__":
    scrape_price()
