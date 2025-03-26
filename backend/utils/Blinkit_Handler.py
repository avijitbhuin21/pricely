import requests
import os
import json
import urllib.parse
from dotenv import load_dotenv
import uuid

# LOCAL IMPORTS
from .universal_function import *

load_dotenv()




def get_blinkit_credentials(location_data):
    for i in range(3):
        try:
            params = {
                'url': 'https://blinkit.com',
                'apikey': os.getenv('ZENROWS_API_KEY'),
            }
            response = requests.get('https://api.zenrows.com/v1/', params=params)
            req_key = json.loads(response.text.split('window.grofers.CONFIG = ')[-1].split('};')[0] + '}')['requestKey']
            appVersion = json.loads(response.text.split('window.grofers.CONFIG = ')[-1].split('};')[0] + '}')['appVersion']
            device_id = dict(response.headers)['Zr-Cookies'].split('gr_1_deviceId=')[-1].split(';')[0]

            data = {}
            data['BLINKIT'] = {
                'device_id': device_id,
                'appversion': appVersion,
                'cookies': response.headers['Zr-Cookies'],
                'lat': location_data['results'][0]['geometry']['location']['lat'],
                'lon': location_data['results'][0]['geometry']['location']['lng'],
            }

            log_debug(device_id, 'device_id')
            log_debug(appVersion, 'appVersion')

            headers = {
                'Cookies': response.headers['Zr-Cookies'],
                'req_key': req_key
            }
            params = {
                'url': 'https://blinkit.com/v2/accounts/auth_key/',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
            }
            res = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)
            if res.json()['success'] == True:
                auth_key = res.json()['auth_key']
                data['BLINKIT']['auth_key'] = auth_key
                log_debug(data, 'data')
                return data
            else:
                log_debug("Failed to get auth_key")
                log_debug(res.text, 'ERROR')
        except Exception as e:
            log_debug("Failed to get credentials")
            log_debug(e, 'ERROR')

def format_blinkit_data(data):
    final_data = {'data': {}, 'credentials': data['credentials']}
    results = []
    product_objects = data.get('data', {}).get('objects', [])

    if len(product_objects) > 1:
        for item_outer in product_objects[1:]:
            try:
                tracking_meta = item_outer.get('tracking', {}).get('widget_meta', {})
                product_data = item_outer.get('data', {}).get('product', {})

                if not tracking_meta or not product_data:
                    continue

                # Check for availability via inventory
                inventory = product_data.get('inventory')
                if inventory is None or inventory <= 0:
                    continue # Skip if inventory is 0 or less

                name = tracking_meta.get('title')
                price = tracking_meta.get('custom_data', {}).get('price')
                product_id = tracking_meta.get('id')
                quantity = product_data.get('unit')

                image_url = None
                rfc_actions = product_data.get('rfc_actions_v2', {}).get('default', [])
                if rfc_actions and isinstance(rfc_actions, list) and len(rfc_actions) > 0:
                    cart_item = rfc_actions[0].get('remove_from_cart', {}).get('cart_item', {})
                    image_url = cart_item.get('image_url')

                product_url = None
                if name and product_id:
                   product_url = f'https://blinkit.com/prn/{blinkit_clean_string(name)}/prid/{product_id}'


                if name and price is not None and image_url and quantity and product_url:
                    results.append({
                        "platform": "Blinkit",
                        "name": name,
                        "price": str(price),
                        "image_url": image_url,
                        "product_url": product_url,
                        "quantity": quantity
                    })

            except (KeyError, IndexError, TypeError) as e:
                # Skip item if expected data structure is not found or error occurs
                continue

    final_data['data'] = results
    return final_data


def search_blinkit(item_name, location_data, credentials= None):
    locality=location_data['results'][0]['address_components'][4]['long_name']
    landmark= urllib.parse.quote(location_data['results'][0]['formatted_address'])

    log_debug(locality, 'locality')
    log_debug(landmark, 'landmark')

    credentials = get_blinkit_credentials(location_data) if credentials is None else credentials

    for i in range(3):
        try:
            data = credentials['BLINKIT']
            auth_key = data['auth_key']
            device_id = data['device_id']
            appVersion = data['appversion']
            cookies = data['cookies']
            lat = data['lat']
            lon = data['lon']

            headers = {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'app_client': 'consumer_web',
                'app_version': str(appVersion) ,
                'auth_key': str(auth_key),
                'content-type': 'application/json',
                'device_id': str(device_id),
                'lat': str(lat),
                'lon': str(lon),
                'priority': 'u=1, i',
                'referer': 'https://blinkit.com/s/?q=basmati',
                'rn_bundle_version': '1009003012',
                'sec-ch-ua': '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'session_uuid': str(uuid.uuid4()),
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
                'web_app_version': '1008010016',
                'cookie': str(cookies) + f"; gr_1_lat={lat}; gr_1_lon={lon}; gr_1_locality={locality}; gr_1_landmark={landmark}",
            }

            url = f'https://blinkit.com/v6/search/products?start=0&size=30&search_type=6&q={urllib.parse.quote(item_name)}'
            params = {
                'url': url,
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
            }
            res = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)
            return format_blinkit_data({"data": res.json(), "credentials": credentials})
        except Exception as e:
            log_debug("INVALID CREDENTIALS, TRYING TO FETCH NEW CREDENTIALS")
            log_debug(e, 'ERROR')
            credentials = get_blinkit_credentials(location_data)

    return {"data":{}, "credentials": {}}
