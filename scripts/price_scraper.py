import requests
import json
from datetime import datetime
import pytz

def scrape_price():
    url = "https://axa-mandiri.co.id/laporan-keuangan-detail"
    
    try:
        params = {
            'p_p_id': 'NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon',
            'p_p_lifecycle': '2',
            'p_p_state': 'normal',
            'p_p_mode': 'view',
            'p_p_resource_id': 'getChartData',
            'p_p_cacheability': 'cacheLevelPage',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_authToken': 'Nqx2KlqA'
        }

        data = {
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_daysPeriod': '1',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_startDate': '',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_endDate': '',
            '_NAV_Laporan_Widget_Portlet_INSTANCE_8J6RSFs2GFon_fundCode': 'Mandiri Attractive Equity Money Rupiah'
        }

        headers = {
            'Accept': '*/*',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://axa-mandiri.co.id',
            'Referer': 'https://axa-mandiri.co.id/laporan-keuangan-detail',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        response = requests.post(url, params=params, headers=headers, data=data)
        response.raise_for_status()

        data_list = json.loads(response.text)[0]
        
        # Sort by date to get the most recent price
        sorted_data = sorted(
            data_list,
            key=lambda x: datetime.strptime(x['navDate'], '%Y-%m-%d %H:%M:%S.%f'),
            reverse=True
        )
        
        latest_price = next(
            (item for item in sorted_data if item['fundCode'] == 'ATRP'),
            None
        )

        if latest_price:
            price_data = {
                'price': float(latest_price['bidValue']),
                'timestamp': latest_price['navDate']
            }
            
            # Save to public directory
            with open('public/latest_price.json', 'w') as f:
                json.dump(price_data, f)
                
            print(f"Successfully saved price: {price_data}")
            return price_data
        else:
            raise Exception("Price not found in response")

    except Exception as e:
        print(f"Error scraping price: {str(e)}")
        return None

if __name__ == "__main__":
    scrape_price() 
