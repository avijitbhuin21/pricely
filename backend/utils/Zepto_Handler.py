import requests
import urllib
import json
import os
from dotenv import load_dotenv

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
    for i in data['data']['layout'][1:]:
        products = i['data']['resolver']['data']['items']
        for j in products:
            item = {
                'name': j['productResponse']['product']['name'],
                'price': str(int(j['productResponse']['superSaverSellingPrice'])//100),
                'image': convert_to_image_url_zepto(j['productResponse']['productVariant']['images'][0]['path'], j['productResponse']['product']['name']),
                'url': f'https://www.zeptonow.com/pn/{blinkit_clean_string(j['productResponse']['product']['name'])}/pvid/{j['productResponse']['productVariant']['id']}',
                'quantity': j['productResponse']['productVariant']['formattedPacksize'],
            }
            formatted_name = format_name(j['productResponse']['product']['name'])

            log_debug(j['productResponse']['outOfStock'], 'outOfStock', 'WARNING')

            if j['productResponse']['outOfStock'] != True:
                if formatted_name in final_data['data']:
                    final_data['data'][formatted_name].append(item)
                else:
                    final_data['data'][formatted_name] = [item]

    return final_data

def search_zepto(item_name, location_data, credentials=None):

    for i in range(3):
        try:
            credentials = get_zepto_credentials(location_data) if credentials is None else credentials
            storeId = credentials['ZEPTO']['storeId']
            if storeId == 'location not servicable':
                return {"data": {}, "credentials": {}}

            headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'appversion': '12.59.0',
                'content-type': 'application/json',
                'platform': 'WEB',
                'priority': 'u=1, i',
                'referer': 'https://www.zeptonow.com/',
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

            return format_zepto_data({"data": response.json(), "credentials": credentials})
        except Exception as e:
            log_debug(str(e), 'Error', 'ERROR')
            credentials = get_zepto_credentials(location_data)

    return {"data":{}, "credentials": {}}
    
