import requests
import uuid
import time
from dotenv import load_dotenv
import os
import random
import json
import urllib.parse

# LOCAL IMPORTS
from .universal_function import *

load_dotenv()


def update_address_in_session(location_data, cookies, headers, session_id):
    for i in range(3):
        try:
            lat = location_data['results'][0]['geometry']['location']['lat']
            long = location_data['results'][0]['geometry']['location']['lng']
            zipcode = location_data['results'][0]['address_components'][-1]['long_name']
            bigbasket_com = uuid.uuid4()
            jarvis_id = uuid.uuid4()
            
            new_cookies = {
                'ufi': '1',
                'bigbasket.com': str(bigbasket_com),
                '_gcl_au': '1.1.995482043.1741792204',
                'jarvis-id': str(jarvis_id),
                'adb': '0',
                '_fbp': 'fb.1.1741792204246.62251282917562310',
                '_ga_FRRYG5VKHX': 'GS1.1.1741792204.1.0.1741792204.60.0.0',
                '_ga': 'GA1.2.1851803795.1741792204',
                '_gid': 'GA1.2.1660596046.1741792204',
                '_gat_UA-27455376-1': '1',
            }
            cookies.update(new_cookies)
            
            new_headers = {
                'content-type': 'application/json',
                'x-caller': 'UI-KIRK',
                'x-channel': 'BB-WEB',
                'x-csurftoken': cookies.get('csurftoken', ''),
                'x-entry-context': 'bb-b2c',
                'x-entry-context-id': '100',
                'x-requested-with': 'XMLHttpRequest',
                'x-tracker': str(uuid.uuid4()),
                'Cookie': dict_to_cookie_string(cookies)
            }
            headers.update(new_headers)

            json_data = {
                'lat': float(lat),
                'long': float(long),
                'return_hub_cookies': False,
                'contact_zipcode': str(zipcode),
            }
            if json_data and isinstance(json_data, dict):
                json_data = json.dumps(json_data)
                if headers and 'content-type' not in {k.lower(): v for k, v in headers.items()}:
                    headers['Content-Type'] = 'application/json'

            params = {
                'url': 'https://www.bigbasket.com/member-svc/v2/member/current-delivery-address/',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
                'session_id': str(session_id)
            }
            
            response = requests.put(
                    'https://api.zenrows.com/v1/', 
                    params=params,
                    headers=headers,
                    data=json_data 
                )
            log_debug(dict(response.headers), "BigBasket Cookies")
            if 'Zr-Cookies' in dict(response.headers):
                cookies.update(parse_cookies(dict(response.headers)['Zr-Cookies']))
                
                
            log_debug("Address updated successfully", "BigBasket")
            log_debug(json_data, "Address_Data")
            return headers, cookies
            
        except Exception as e:
            log_debug(f"Failed to update address: {str(e)}", "BigBasket", "ERROR")
    return False

def get_address_info_varifiers(cookies, headers, session_id):
    for i in range(3):
        try:
            headers = {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'upgrade-insecure-requests': '1',
                'Cookie': dict_to_cookie_string(cookies),
            }
            headers.update(headers)

            params = {
                'url': 'https://www.bigbasket.com/',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
                'session_id': str(session_id)
            }
            
            response = requests.get(
                    'https://api.zenrows.com/v1/', 
                    params=params,
                    headers=headers
                )
            auth_key = response.text.split(',"buildId":"')[-1].split('",')[0]
            
            if 'Zr-Cookies' in dict(response.headers):
                cookies.update(parse_cookies(dict(response.headers)['Zr-Cookies']))
                log_debug(cookies, "BigBasket Cookies")
                
            log_debug(parse_cookies(dict(response.headers)['Zr-Cookies']), "BigBasket address info")
            return headers, cookies, auth_key
            
        except Exception as e:
            log_debug(f"Failed to verify address: {str(e)}", "BigBasket", "ERROR")
    return False

def fetch_csurf_token(cookies, headers, session_id):
    for i in range(3):
        try:
            headers = {
                'accept': '*/*',
                'content-type': 'application/json',
                'x-channel': 'BB-WEB',
                'x-tracker': str(uuid.uuid4()),
                'Cookie': dict_to_cookie_string(cookies),
            }
            headers.update(headers)

            params = {
                '_': str(int(time.time() * 1000)),
                'send_address_set_by_user': 'true',
            }

            url_parts = list(urllib.parse.urlparse('https://www.bigbasket.com/ui-svc/v2/header'))
            query = dict(urllib.parse.parse_qsl(url_parts[4]))
            query.update(params)
            url_parts[4] = urllib.parse.urlencode(query)
            url = urllib.parse.urlunparse(url_parts)

            params = {
                'url': url,
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
                'session_id': str(session_id)
            }
            
            response = requests.get(
                    'https://api.zenrows.com/v1/', 
                    params=params,
                    headers=headers
                )
            
            cookies.update(parse_cookies(dict(response.headers)['Zr-Cookies']))
            log_debug("CSRF token fetched successfully", "BigBasket")
            return headers, cookies
            
        except Exception as e:
            log_debug(f"Failed to fetch CSRF token: {str(e)}", "BigBasket", "ERROR")
    return False

def get_initial_cookies(headers, session_id):
    for i in range(3):
        # Initial connection
        url = "https://www.bigbasket.com/"
        params = {
            'url': url,
            'apikey': os.getenv('ZENROWS_API_KEY'),
            'custom_headers': 'true',
            'session_id': str(session_id)
        }

        response = requests.get(
                    'https://api.zenrows.com/v1/', 
                    params=params,
                    headers=headers
                )
        
        log_debug(response.headers, "BigBasket Headers")

        if 'Zr-Cookies' in dict(response.headers):
            cookies = parse_cookies(dict(response.headers)['Zr-Cookies'])
            log_debug("Initial connection established", "BigBasket")
            return cookies
    return {}


def get_Bigbasket_Credentials(location_data):
    headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'priority': 'u=0, i',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        }
    session_id = "".join([random.choice('123456789') for i in range(5)])

    cookies = get_initial_cookies(headers, session_id)


    xx = fetch_csurf_token(cookies, headers, session_id)
    if xx != False:
        h,c = xx
        headers.update(h)
        cookies.update(c)
    else:
        raise Exception("Failed to fetch CSRF token")
    
    xx = update_address_in_session(location_data, cookies, headers, session_id)
    if xx != False:
        h,c = xx
        headers.update(h)
        cookies.update(c)
    else:
        raise Exception("Failed to update address")

    xx = get_address_info_varifiers(cookies, headers, session_id)
    if xx != False:
        h,c,a = xx
        headers.update(h)
        cookies.update(c)
    else:
        log_debug(xx)
        raise Exception("Failed to verify address")

    log_debug("Session initialized successfully", "BigBasket", "INFO")

    data = {}
    data['BigBasket'] = {
        'auth_string': dict_to_cookie_string(cookies),
        'lat': location_data['results'][0]['geometry']['location']['lat'],
        'lon': location_data['results'][0]['geometry']['location']['lng'],
        'headers': headers,
        "auth_key": a
    }
    return data
        
def update_Bigbasket_Data(lat, lon, query):
    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://quickcompare.in',
        'priority': 'u=1, i',
        'referer': 'https://quickcompare.in/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
    }

    try:
        params = {
            'url': f'https://qp94doiea4.execute-api.ap-south-1.amazonaws.com/default/qc?lat={lat}&lon={lon}&type=groupsearch&query={urllib.parse.quote(query)}&page=1',
            'apikey': os.getenv('ZENROWS_API_KEY'),
            'custom_headers': 'true',
        }
        
        response = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)
        response.raise_for_status()
        api_data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return [
            {"data": [], "credentials": {}},
            {"data": [], "credentials": {}}
        ]
    except ValueError as e: 
        print(f"Failed to decode JSON response: {e}")
        print(f"Response text: {response.text}")
        return [
            {"data": [], "credentials": {}},
            {"data": [], "credentials": {}}
        ]

    bigbasket_products = []
    zepto_products = []

    required_keys = ['name', 'offer_price', 'images', 'deeplink', 'quantity', 'platform']

    for item_group in api_data:
        if 'data' not in item_group or not isinstance(item_group['data'], list):
            continue 

        products = item_group['data']
        for product in products:
            if not isinstance(product, dict) or not all(k in product for k in required_keys):
                continue

            platform_info = product.get('platform')
            if not isinstance(platform_info, dict) or 'name' not in platform_info:
                continue

            platform_name = platform_info.get('name')
            if not product.get('images') or not isinstance(product['images'], list) or len(product['images']) == 0:
                 continue
            if platform_name == 'BigBasket':
                try:
                     formatted_product = {
                        "platform": "Bigbasket", 
                        "name": product.get('name'),
                        "price": str(product.get('offer_price')), 
                        "image_url": product['images'][0],
                        "product_url": product.get('deeplink'),
                        "quantity": product.get('quantity')
                    }
                     bigbasket_products.append(formatted_product)

                except (KeyError, IndexError, TypeError) as e:
                    print(f"Skipping BigBasket product due to formatting error: {product.get('id', 'N/A')} - {e}")

            elif platform_name == 'Zepto':
                try:
                     formatted_product = {
                        "platform": "Zepto",
                        "name": product.get('name'),
                        "price": str(product.get('offer_price')), 
                        "image_url": product['images'][0], 
                        "product_url": product.get('deeplink'),
                        "quantity": product.get('quantity')
                    }
                     zepto_products.append(formatted_product)

                except (KeyError, IndexError, TypeError) as e:
                    print(f"Skipping Zepto product due to formatting error: {product.get('id', 'N/A')} - {e}")

    output_dict_1 = {
        "data": bigbasket_products,
        "credentials": {}
    }

    output_dict_2 = {
        "data": zepto_products,
        "credentials": {}
    }

    return [output_dict_1, output_dict_2]



def format_bigbasket_data(data):
    final_data = {'data': {}, 'credentials': data['credentials']}
    results = []
    products = data["data"]["pageProps"]["SSRData"]["tabs"][0]["product_info"]["products"]
    
    for product in products:
        if product["availability"]["avail_status"] == "001":
            result = {
                "platform": "bigbasket",
                "name": product["desc"],
                "price": product["pricing"]["discount"]["prim_price"]["sp"],
                "image_url": product["images"][0]["s"],
                "product_url": f"https://www.bigbasket.com{product['absolute_url']}",
                "quantity": product["w"]
            }
            results.append(result)
        
        for child in product.get("children", []):
            if child["availability"]["avail_status"] == "001":
                result = {
                    "platform": "bigbasket",
                    "name": child["desc"],
                    "price": child["pricing"]["discount"]["prim_price"]["sp"],
                    "image_url": child["images"][0]["s"],
                    "product_url": f"https://www.bigbasket.com{child['absolute_url']}",
                    "quantity": child["w"]
                }
                results.append(result)
        final_data['data'] = results
    return final_data

def search_bigbasket(item_name, location_data, credentials=None):

    for i in range(3):
        if credentials != "cred":
            return update_Bigbasket_Data(
                location_data['results'][0]['geometry']['location']['lat'],
                location_data['results'][0]['geometry']['location']['lng'],
                item_name
            )
        try:
            data = credentials['BigBasket']
            auth_string = data['auth_string']
            headers = data['headers']
            auth_key = data['auth_key']

            new_headers = {
                'accept': '*/*',
                'priority': 'u=1, i',
                'x-nextjs-data': '1',
                'Cookie': auth_string,
            }
            headers.update(new_headers)

            params = {
                'url': f'https://www.bigbasket.com/_next/data/{auth_key}/ps.json?q={urllib.parse.quote(item_name)}&nc=as&listing=ps',
                'apikey': os.getenv('ZENROWS_API_KEY', ''),
                'custom_headers': 'true',
            }
            
            response = requests.get(
                'https://api.zenrows.com/v1/',
                headers=headers,
                params=params,
            )
            log_debug(response.status_code, "BigBasket_status")
            if response.status_code == 404:
                return {"data": {}, "credentials": credentials}
            return format_bigbasket_data({"data": response.json(), "credentials": credentials})
        
        except (requests.RequestException, KeyError) as e:
            log_debug(f"Error in BigBasket search: {str(e)}, Retrying with new credentials...", "BigBasket", "ERROR")
            try:
                bigbasket_credentials = get_Bigbasket_Credentials(location_data)
                credentials['BigBasket'] = bigbasket_credentials['BigBasket']
            except Exception as ex:
                log_debug(f"Failed to regenerate BigBasket credentials: {str(ex)}", "BigBasket", "ERROR")
                if i == 2:  # Last retry
                    return {"data": {}, "credentials": credentials}

    return {"data": {}, "credentials": credentials}