# Removed comments and docstrings

import re
import math
import json
import os
from dotenv import load_dotenv
load_dotenv()
from sentence_transformers import util # Keep for potential cosine similarity calculation if numpy method fails
import numpy as np
import sys
# Use only the specified import as requested
from mistralai import Mistral

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
MISTRAL_EMBED_MODEL = "mistral-embed"

PRICE_TOLERANCE = 0.20
NAME_SIMILARITY_THRESHOLD = 0.90
QUANTITY_TOLERANCE = 0.10

def parse_quantity(quantity_str):
    if not isinstance(quantity_str, str):
        quantity_str = str(quantity_str)

    quantity_str = quantity_str.lower().strip()
    quantity_str = re.sub(r'\bltr\b', 'l', quantity_str)
    quantity_str = re.sub(r'\bgm\b', 'g', quantity_str)
    quantity_str = re.sub(r'\bkg\b', 'kg', quantity_str)
    quantity_str = re.sub(r'\b(\d)\s*([a-z])', r'\1\2', quantity_str)

    value = None
    unit = None

    match_pack = re.match(r'(\d+)\s*x\s*([\d.]+)\s*([a-z]+)', quantity_str) or \
                 re.match(r'([\d.]+)\s*([a-z]+)\s*x\s*(\d+)', quantity_str)
    if match_pack:
        groups = match_pack.groups()
        if len(groups) == 3:
            try:
                if groups[0].isdigit():
                    count = int(groups[0]); val = float(groups[1]); unit = groups[2]
                else:
                    val = float(groups[0]); unit = groups[1]; count = int(groups[2])
                value = count * val
            except ValueError: pass

    if value is None:
        match_simple = re.match(r'([\d.]+)\s*([a-z]+)', quantity_str)
        if match_simple:
            try:
                value = float(match_simple.group(1)); unit = match_simple.group(2)
            except ValueError: pass

    if value is None:
         match_count = re.match(r'^([\d.]+)$', quantity_str)
         if match_count:
             try:
                 value = int(match_count.group(1)); unit = 'count'
             except ValueError:
                  try:
                      f_val = float(match_count.group(1))
                      if f_val.is_integer(): value = int(f_val); unit = 'count'
                  except ValueError: pass

    if value is not None and unit is not None:
        if unit == 'l': value *= 1000; unit = 'ml'
        elif unit == 'kg': value *= 1000; unit = 'g'
        return {'value': value, 'unit': unit}
    return None

def are_prices_close(price1, price2, tolerance):
    if price1 is None or price2 is None: return False
    if price1 == 0 and price2 == 0: return True
    if price1 == 0 or price2 == 0: return False
    # Ensure max() is not zero before division, although covered by previous checks
    max_price = max(abs(price1), abs(price2))
    if max_price == 0: return True # Should be covered by price1==0 and price2==0
    return abs(price1 - price2) / max_price <= tolerance


def are_quantities_similar(q1, q2, tolerance):
    if q1 is None or q2 is None: return False
    if q1['unit'] != q2['unit']: return False
    value1, value2 = q1['value'], q2['value']
    if value1 == 0 and value2 == 0: return True
    if value1 == 0 or value2 == 0: return False
    # Ensure max() is not zero before division
    max_val = max(abs(value1), abs(value2))
    if max_val == 0: return True # Should be covered by value1==0 and value2==0
    return abs(value1 - value2) / max_val <= tolerance


def group_and_sort_products(products_data, search_query):
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY environment variable not set.")

    print("Initializing Mistral client...")
    # Use the specific import requested by the user
    client = Mistral(api_key=MISTRAL_API_KEY)
    print("Client initialized.")

    print("Generating query embedding...")
    try:
        # Assuming 'Mistral' class uses '.embeddings.create'
        query_embedding_response = client.embeddings.create(
            model=MISTRAL_EMBED_MODEL,
            inputs=[search_query] # Use 'inputs' for list
        )
        query_embedding_np = np.array(query_embedding_response.data[0].embedding)
        print(f"Query embedding generated ({query_embedding_response.usage.total_tokens} tokens used).")
    except Exception as e:
        print(f"Error getting query embedding: {e}")
        raise

    processed_products = []
    print("Preprocessing products...")
    for i, p in enumerate(products_data):
        try:
            price_str = str(p.get('price', 'NaN'))
            price = float(price_str.replace(',', '')) if price_str != 'NaN' else None
        except ValueError: price = None
        quantity_str = p.get('quantity', ''); parsed_qty = parse_quantity(quantity_str)
        processed_products.append({
            'original_data': p, 'id': i, 'name': p.get('name', ''),
            'price': price, 'parsed_quantity': parsed_qty, 'embedding': None
        })

    print(f"Generating name embeddings using {MISTRAL_EMBED_MODEL}...")
    product_names = [p['name'] for p in processed_products if p['name']]
    original_indices_with_names = [i for i, p in enumerate(processed_products) if p['name']]

    if not product_names:
        print("Warning: No valid product names found to generate embeddings.")
        embeddings_np = []
        usage_tokens = 0
    else:
        try:
             # Assuming 'Mistral' class uses '.embeddings.create'
            embeddings_response = client.embeddings.create(
                 model=MISTRAL_EMBED_MODEL,
                 inputs=product_names # Use 'inputs' for list
            )
            usage_tokens = embeddings_response.usage.total_tokens

            # Map embeddings back using index - assuming response order matches input order
            if len(embeddings_response.data) != len(product_names):
                print(f"Warning: Mismatch in embedding response length. Expected {len(product_names)}, got {len(embeddings_response.data)}")
                # Handle mismatch - basic approach: pad or trim (less safe)
                # Safer: Use index if available and reliable
                embedding_map = {data.index: data.embedding for data in embeddings_response.data}
                temp_embeddings_np = [np.array(embedding_map.get(i, None)) for i in range(len(product_names))]

            else:
                 # Assume order matches if length is correct
                 temp_embeddings_np = [np.array(data.embedding) for data in embeddings_response.data]

            full_embeddings_np = [None] * len(processed_products)
            for original_idx, emb in zip(original_indices_with_names, temp_embeddings_np):
                 if emb is not None:
                     full_embeddings_np[original_idx] = emb
            embeddings_np = full_embeddings_np

        except Exception as e:
            print(f"Error calling Mistral API for product embeddings: {e}")
            raise

    for i, p in enumerate(processed_products):
        if i < len(embeddings_np): p['embedding'] = embeddings_np[i]
        else: p['embedding'] = None # Fallback if something went wrong with length

    print(f"Embeddings generated ({usage_tokens} tokens used).")

    groups = []
    grouped_ids = set()

    print("Grouping products...")
    for i, product1 in enumerate(processed_products):
        if product1['id'] in grouped_ids: continue
        current_group_items = [product1]; grouped_ids.add(product1['id'])

        for j in range(i + 1, len(processed_products)):
            product2 = processed_products[j]
            if product2['id'] in grouped_ids: continue
            if product1['embedding'] is None or product2['embedding'] is None: continue

            price_match = are_prices_close(product1['price'], product2['price'], PRICE_TOLERANCE)
            quantity_match = are_quantities_similar(product1['parsed_quantity'], product2['parsed_quantity'], QUANTITY_TOLERANCE)

            emb1, emb2 = product1['embedding'], product2['embedding']
            norm1, norm2 = np.linalg.norm(emb1), np.linalg.norm(emb2)
            name_sim = np.dot(emb1, emb2) / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0.0
            name_match = name_sim >= NAME_SIMILARITY_THRESHOLD

            if price_match and quantity_match and name_match:
                current_group_items.append(product2)
                grouped_ids.add(product2['id'])

        representative_product = current_group_items[0]['original_data']
        representative_embedding = current_group_items[0]['embedding']

        query_sim_score = -1.0
        if representative_embedding is not None and query_embedding_np is not None:
            rep_norm = np.linalg.norm(representative_embedding); query_norm = np.linalg.norm(query_embedding_np)
            if rep_norm > 0 and query_norm > 0:
                 query_sim_score = np.dot(representative_embedding, query_embedding_np) / (rep_norm * query_norm)

        output_group = {
            "name": representative_product['name'], "image": representative_product.get('image_url'),
            "_internal_items": current_group_items, "_query_similarity": query_sim_score, "price": []
        }
        min_price = float('inf'); min_quantity_value = float('inf')

        for item in current_group_items:
            orig_data = item['original_data']
            output_group["price"].append({
                "store": orig_data.get('platform'), "price": item['price'],
                "quantity": orig_data.get('quantity', ''), "url": orig_data.get('product_url')
            })
            if item['price'] is not None: min_price = min(min_price, item['price'])
            if item['parsed_quantity'] is not None: min_quantity_value = min(min_quantity_value, item['parsed_quantity']['value'])

        output_group["_min_price"] = min_price if min_price != float('inf') else None
        output_group["_min_quantity_value"] = min_quantity_value if min_quantity_value != float('inf') else None

        groups.append(output_group)

    print(f"Grouping complete. Found {len(groups)} groups.")

    print("Sorting groups...")
    def sort_key(group):
        query_similarity = group.get('_query_similarity', -1.0)
        num_stores = len(group['price'])
        min_price = group.get('_min_price', float('inf'))
        if min_price is None: min_price = float('inf')
        min_qty = group.get('_min_quantity_value', float('inf'))
        if min_qty is None: min_qty = float('inf')
        return (-query_similarity, -num_stores, min_price, min_qty)

    groups.sort(key=sort_key)
    print("Sorting complete.")

    final_result = []
    for group in groups:
        del group['_internal_items']; del group['_min_price']
        del group['_min_quantity_value']; del group['_query_similarity']
        final_result.append(group)

    return final_result[:35] #Max 35 results
