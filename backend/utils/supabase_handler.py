import os
from supabase import create_client, Client
from typing import Dict, Any, List, Optional
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)

# =============================================== BASE FUNCTIONS ===================================================

def select_data(table: str, query_params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    try:
        query = supabase.table(table).select("*")
        
        if query_params:
            for key, value in query_params.items():
                query = query.eq(key, value)
                
        response = query.execute()
        return response.data
    except Exception as e:
        raise Exception(f"Error selecting data from {table}: {str(e)}")

def insert_data(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = supabase.table(table).insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise Exception(f"Error inserting data into {table}: {str(e)}")

def update_data(table: str, match_criteria: Dict[str, Any], new_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        query = supabase.table(table)
        
        # Apply match criteria
        for key, value in match_criteria.items():
            query = query.eq(key, value)
            
        response = query.update(new_data).execute()
        return response.data
    except Exception as e:
        raise Exception(f"Error updating data in {table}: {str(e)}")

def delete_data(table: str, match_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        query = supabase.table(table)
        
        # Apply match criteria
        for key, value in match_criteria.items():
            query = query.eq(key, value)
            
        response = query.delete().execute()
        return response.data
    except Exception as e:
        raise Exception(f"Error deleting data from {table}: {str(e)}")

# =============================================== ENCRYPTION FUNCTIONS ===================================================
def get_sha256_hash(text):
    if isinstance(text, str):
        text = text.encode('utf-8')
    hash_object = hashlib.sha256(text)
    return hash_object.hexdigest()





# ================================================ USER FUNCTIONS ===================================================

def signup(username, password, mobile):
    hashed_password = get_sha256_hash(password)
    user_data = {
        "name": username,
        "password": hashed_password,
        "mobile": mobile,
        "is_premium": False,
    }
    try:
        insert_data("users", user_data)
        return {"status": "success", "message": "User created successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def login(username, password):
    hashed_password = get_sha256_hash(password)
    user_data = {
        "name": username,
        "password": hashed_password,
    }
    users = select_data("users", user_data)
    if not users:
        return {"status": "error", "message": "Invalid username or password"}
    else:
        return {"status": "success", "user": users[0]}
    
def tanddn():
    try:
        data = select_data("trending_and_daily_needs")
        return {"status": "success", "data": {"trending": [{"url": i['image_url'], "name": i['name']} for i in data['data'] if i['column_type'] == "trending"], "daily_needs":[{"url": i['image_url'], "name": i['name']} for i in data['data'] if i['column_type'] == "daily needs"]}}
    except Exception as e:
        return {"status": "error", "message": str(e)}