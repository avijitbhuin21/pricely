import requests
import urllib.parse
import os
from dotenv import load_dotenv

load_dotenv()

# LOCAL IMPORTS
from .universal_function import *

headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://www.dmart.in',
            'priority': 'u=1, i',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        }

def check_location_service_status(location_data):
    
    json_data = {
        'uniqueId': location_data['results'][0]['place_id'],
        'apiMode': 'GA',
        'pincode': '',
        'currentLat': '',
        'currentLng': '',
    }

    params = {
        'url': 'https://digital.dmart.in/api/v2/pincodes/details',
        'apikey': os.getenv('ZENROWS_API_KEY'),
        'custom_headers': 'true',
    }
    response = requests.post('https://api.zenrows.com/v1/', params=params, headers=headers, json=json_data)

    log_debug(response.json(), 'response')

    if response.json()['isPincodeServiceable'] != 'true':
        return False
        
def format_dmart_data(data):
    final_data = {'data': {}, 'credentials': data['credentials']}

    for i in data['data']['products']:
        item = {
            'name': i['name'],
            'price': i['sKUs'][0]['priceSALE'],
            'image': f'https://cdn.dmart.in/images/products/{i['sKUs'][0]['productImageKey']}_{i['sKUs'][0]['imgCode']}_B.jpg',
            'url': f'https://www.dmart.in/product/{i['seo_token_ntk']}',
            'quantity': i['sKUs'][0]['variantTextValue'],
        }
        formatted_name = format_name(i['name'])
        if formatted_name in final_data['data']:
            final_data['data'][formatted_name].append(item)
        else:
            final_data['data'][formatted_name] = [item]

    return final_data

def search_dmart(item_name, location_data, credentials=None):
    if check_location_service_status(location_data) == False:
        return {"status": "Failed", "message": "Location is not serviceable"}

    else:
        for i in range(3):
            try:
                params = {
                'url': f'https://digital.dmart.in/api/v3/search/{urllib.parse.quote(item_name)}?page=1&size=100&channel=web&storeId=10680',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
            }

                response = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)

                return format_dmart_data({"data": response.json(), "credentials": credentials})
            except Exception as e:
                log_debug(f"Failed to fetch data: {str(e)}", "Error", "ERROR")
                continue
        
        return {"data":{}, "credentials": {}}