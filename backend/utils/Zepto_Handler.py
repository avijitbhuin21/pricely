import requests
import urllib
import json
import os
from dotenv import load_dotenv
import uuid

# LOCAL IMPORTS
from .universal_function import *

load_dotenv()


def get_zepto_credentials(location_data):
    pos_data = {"latitude":location_data['results'][0]['geometry']['location']['lat'],"longitude":location_data['results'][0]['geometry']['location']['lng']}
    log_debug(pos_data, 'pos_data')

    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i',
        'referer': 'https://www.zeptonow.com/search',
        'rsc': '1',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        'cookie': f'user_position={urllib.parse.quote(json.dumps(pos_data).replace(" ", ""))}; latitude={location_data['results'][0]['geometry']['location']['lat']}; longitude={location_data['results'][0]['geometry']['location']['lng']}'
    }

    params = {
        'url': 'https://www.zeptonow.com/search',
        'apikey': os.getenv('ZENROWS_API_KEY'),
        'custom_headers': 'true',
    }

    response = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)
    log_debug(response.headers, 'response')

    data_str = parse_cookies(dict(response.headers) ['Zr-Cookies'])['serviceability']
    storeId = json.loads(urllib.parse.unquote_plus(data_str))
    if storeId['primaryStore']['serviceable'] == False:
        storeId = 'location not servicable'
    else:
        storeId = storeId['primaryStore']['storeId']

   
    log_debug(storeId, 'storeid')
    
    data = {}
    data['ZEPTO'] = {
        'storeId': storeId,
    }
    

    return data

def format_zepto_data(data):
    final_data = {'data': {}, 'credentials': data['credentials']}
    results_list = []
    base_product_url = "https://www.zeptonow.com/pn/"

    layout = data.get("data", {}).get("layout", [])

    for widget in layout:
        widget_name = widget.get("widgetName", "")
        if widget_name.startswith("SEARCHED_PRODUCTS"):
            items = widget.get("data", {}).get("resolver", {}).get("data", {}).get("items", [])
            for item in items:
                product_response = item.get("productResponse")
                if not product_response:
                    continue

                if not product_response.get("outOfStock", True):
                    try:
                        product_info = product_response.get("product", {})
                        variant_info = product_response.get("productVariant", {})

                        name = product_info.get("name")
                        if not name:
                            continue

                        # Use superSaverSellingPrice as per user example
                        price_raw = product_response.get("superSaverSellingPrice")
                        # Format price as string integer part after division by 100
                        price = str(price_raw // 100) if price_raw is not None else "N/A"

                        images = variant_info.get("images", [])
                        image_path = images[0]['path'] if images and 'path' in images[0] else None
                        # Use the provided function for image URL
                        image_url = convert_to_image_url_zepto(image_path, name) if image_path else ""

                        variant_id = variant_info.get("id")
                        if not variant_id:
                           continue

                        # Use the provided function for cleaning the name for URL
                        cleaned_name = blinkit_clean_string(name)
                        # Handle potential empty cleaned_name
                        if not cleaned_name:
                             cleaned_name = "product" # Default slug if name cleans to empty

                        product_url = f'{base_product_url}{cleaned_name}/pvid/{variant_id}'

                        quantity = variant_info.get("formattedPacksize", "N/A")

                        results_list.append({
                            "platform": "Zepto",
                            "name": name,
                            "price": price,
                            "image_url": image_url,
                            "product_url": product_url,
                            "quantity": quantity,
                        })
                    except (KeyError, IndexError, TypeError) as e:
                        # Skip product if data extraction fails with new logic
                        continue

    final_data['data'] = results_list

    return final_data

def search_zepto(item_name, location_data, credentials=None):

    for i in range(3):
        try:
            credentials = get_zepto_credentials(location_data) if credentials is None else credentials
            storeId = credentials['ZEPTO']['storeId']
            if storeId == 'location not servicable':
                log_debug('Location not servicable', 'Error', 'ERROR')
                return {"data": {}, "credentials": {}}

            headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'app_sub_platform': 'WEB',
                'app_version': '12.63.1',
                'appversion': '12.63.1',
                'auth_revamp_flow': 'v2',
                'content-type': 'application/json',
                'marketplace_type': 'ZEPTO_NOW',
                'origin': 'https://www.zeptonow.com',
                'platform': 'WEB',
                'priority': 'u=1, i',
                'referer': 'https://www.zeptonow.com/',
                'requestid': str(uuid.uuid4()),
                'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'storeid': storeId,
                'tenant': 'ZEPTO',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
                'x-without-bearer': 'true',
            }

            json_data = {
                'query': item_name,
                'pageNumber': 0,
                'mode': 'AUTOSUGGEST',
            }
            body = json.dumps(json_data, separators=(',', ':'))
            headers['Content-Length'] = str(len(body)) 

            params = {
                'url': 'https://api.zeptonow.com/api/v3/search',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
            }

            response = requests.post(
                'https://api.zenrows.com/v1/',
                params=params,
                headers=headers,
                data=body 
            )
            log_debug(response.json(), 'response', 'INFO')

            return format_zepto_data({"data": response.json(), "credentials": credentials})
        except Exception as e:
            log_debug(str(e), 'Error', 'ERROR')
            credentials = get_zepto_credentials(location_data)

    return {"data":{}, "credentials": {}}
    
