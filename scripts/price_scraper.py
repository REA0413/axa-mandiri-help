import os
import requests
import json
from datetime import datetime

def scrape_price():
    url = "https://axa-mandiri.co.id/laporan-keuangan-detail"
    
    # 1. Get the token from GitHub Secrets (env variable)
    # If not found, it defaults to your last known token
    token = os.environ.get('AXA_TOKEN', 'Nqx2KlqA')
    
    # Use a session to maintain cookies during the request
    session = requests.Session()
    
    headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://axa-mandiri.co.id',
        'Referer': url,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    params = {
        'p_p_id': 'NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon',
        'p_p_lifecycle': '2',
        'p_p_state': 'normal',
        'p_p_mode': 'view',
        'p_p_resource_id': 'getChartData',
        'p_p_cacheability': 'cacheLevelPage',
        '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_authToken': token
    }

    data = {
        '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_daysPeriod': '30',
        '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_startDate': '',
        '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_endDate': '',
        '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_fundCode': 'Mandiri Attractive Equity Money Rupiah'
    }

    try:
        print(f"Starting scrape attempt with token: {token}")
        
        # Initial GET to establish session cookies
        session.get(url, headers={'User-Agent': headers['User-Agent']})
        
        # The POST request to fetch data
        response = session.post(url, params=params, headers=headers, data=data)
        response.raise_for_status()

        # 2. Robust Data Parsing
        raw_response = response.json()
        
        # Check if the response is empty (which causes the 'index out of range' error)
        if not raw_response or not isinstance(raw_response, list) or len(raw_response) == 0:
            print("❌ Error: The server returned an empty list. The token is likely invalid or expired.")
            return

        data_list = raw_response[0]
        
        # Sort by date to get the most recent price
        sorted_data = sorted(
            data_list,
            key=lambda x: datetime.strptime(x['navDate'], '%Y-%m-%d %H:%M:%S.%f'),
            reverse=True
        )
        
        # Look for the specific fund code
        latest_price_entry = next(
            (item for item in sorted_data if item['fundCode'] == 'ATRP'),
            None
        )

        if latest_price_entry:
            price_data = {
                'price': float(latest_price_entry['bidValue']),
                'timestamp': latest_price_entry['navDate']
            }
            
            # Ensure the public directory exists (handled in YAML, but safe to do here too)
            os.makedirs('public', exist_ok=True)
            
            with open('public/latest_price.json', 'w') as f:
                json.dump(price_data, f)
                
            print(f"✅ Successfully saved price: {price_data}")
        else:
            print("⚠️ Success response received, but ATRP fund code was not found in the data.")

    except Exception as e:
        print(f"❌ Error scraping price: {str(e)}")

if __name__ == "__main__":
    scrape_price()
