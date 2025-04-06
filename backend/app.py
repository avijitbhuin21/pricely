from flask import Flask, request, jsonify, session, redirect, url_for, render_template
from dotenv import load_dotenv
import os
from pyngrok import ngrok
from supabase import create_client, Client
import secrets  
from utils.supabase_handler import *

# LOCAL IMPORTS
from utils.main_functions import *

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", secrets.token_hex(16))

@app.route("/send-otp", methods=["POST"])
def send_otp():
    pass

@app.route("/confirm-otp", methods=["POST"])
def confirm_otp():
    pass

@app.route("/autocomplete", methods=["POST"])
def autocomplete():
    data = request.get_json()
    query = data.get("query")
    if not query:
        return jsonify({"status": "error", "message": "Query parameter is required", "data": []}), 400
    else:
        return jsonify({"status": "success", "data": get_suggestions(query)})

@app.route("/login", methods=["POST"])
def login_to_supabase():
    data = request.get_json()
    username = '91' +data.get("phonenumber")
    password = data.get("password")
    if not username or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    try:
        response = login(number=username, password=password)
        if response['status'] == "success":
            return jsonify({"status": "success", "message": "Login successful"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/signup", methods=["POST"])
def signup_to_supabase():
    data = request.get_json()
    username = data.get("name")
    password = data.get("password")
    mobile = '91'+data.get("mobile")
    if not username or not password or not mobile:
        return jsonify({"status": "error", "message": "Username, password and mobile required"}), 400
    try:
        res = signup(username=username, password=password, mobile=mobile)
        if res['status'] == "success":
            return jsonify({"status": "success", "message": "Signup successful"}), 200
        else:
            return jsonify({"status": "error", "message": res['message']}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/trending", methods=["POST"])
def get_trending_and_daily_needs():
    return jsonify(tanddn())    
    

@app.route("/get-search-results", methods=["POST"])
def get_search_results():
    data = request.get_json()
    item_name = data.get("item_name")
    lat = data.get("lat")
    lon = data.get("lon")
    credentials = data.get("credentials", {})

    print("credentials",credentials)

    # data = get_compared_results(item_name, lat, lon, credentials)
    data = open("compared.json", "r").read()
    data = json.loads(data)

    return jsonify({"status": "success", "data": data})

@app.route("/get-api-key", methods=["POST"])
def get_api_key_route():
    key = get_api_key()
    return jsonify(key)

# --- Admin Routes ---

@app.route("/admin")
def admin_panel():
    if 'admin_username' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin_panel.html', username=session['admin_username'])

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if not username or not password:
            return jsonify({"status": "error", "message": "Username and password required"}), 400
        try:
            response = supabase.table('admin_users').select("id, username").eq('username', username).eq('password', password).execute()
            if response.data:
                user = response.data[0]
                session['admin_username'] = user['username']
                return jsonify({"status": "success", "message": "Login successful", "username": user['username']})
            else:
                return jsonify({"status": "error", "message": "Invalid username or password"}), 401
        except Exception as e:
            return render_template('admin_login.html', error="An error occurred during login. Please try again later."), 500
    return render_template('admin_login.html')

@app.route("/admin/verify-session", methods=["POST"])
def verify_admin_session():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"valid": False, "message": "Missing credentials"}), 400
    try:
        response = supabase.table('admin_users').select("id").eq('username', username).eq('password', password).execute()
        if response.data:
            session['admin_username'] = username 
            return jsonify({"valid": True})
        else:
            return jsonify({"valid": False, "message": "Invalid credentials"}), 401 
    except Exception as e:
        return jsonify({"valid": False, "message": "Server error during verification"}), 500

@app.route('/api/offers', methods=['GET'])
def get_offers():
    try:
        response = supabase.table('offers').select("id, image_url, price, created_at").order('created_at', desc=False).execute()
        if response.data:
            return jsonify(response.data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to fetch offers"}), 500

@app.route('/api/offers', methods=['POST'])
def add_offer():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    if not data or 'image_url' not in data or 'price' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or price"}), 400
    try:
        image_url = str(data['image_url']).strip()
        price = str(data['price']).strip() # Store price as text as per schema
        if not image_url or not price:
             return jsonify({"status": "error", "message": "Image URL and Price cannot be empty"}), 400
        new_offer_data = {
            "image_url": image_url,
            "price": price
        }
        response = supabase.table('offers').insert(new_offer_data).execute()
        if response.data:
            inserted_offer = response.data[0]
            return jsonify({"status": "success", "message": "Offer added", "offer": inserted_offer}), 201
        else:
            return jsonify({"status": "error", "message": "Failed to add offer to database"}), 500
    except (ValueError, TypeError) as e:
         return jsonify({"status": "error", "message": "Invalid data format"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to save offer"}), 500
    
@app.route('/api/offers/<int:offer_id>', methods=['PUT'])
def update_offer(offer_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    if not data or 'image_url' not in data or 'price' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or price"}), 400
    try:
        image_url = str(data['image_url']).strip()
        price = str(data['price']).strip() # Store price as text
        if not image_url or not price:
             return jsonify({"status": "error", "message": "Image URL and Price cannot be empty"}), 400
        updated_offer_data = {
            "image_url": image_url,
            "price": price
        }
        response = supabase.table('offers').update(updated_offer_data).eq('id', offer_id).execute()
        if response.data:
            updated_offer = response.data[0] # Get the updated offer data
            return jsonify({"status": "success", "message": f"Offer {offer_id} updated", "offer": updated_offer})
        else:
            check_exists = supabase.table('offers').select('id', count='exact').eq('id', offer_id).execute()
            if check_exists.count == 0:
                 return jsonify({"status": "error", "message": "Offer not found"}), 404
            else:
                 return jsonify({"status": "error", "message": "Failed to update offer in database"}), 500

    except (ValueError, TypeError) as e:
         return jsonify({"status": "error", "message": "Invalid data format"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to update offer"}), 500

@app.route('/api/offers/<int:offer_id>', methods=['DELETE'])
def delete_offer(offer_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        response = supabase.table('offers').delete().eq('id', offer_id).execute()
        if response.data:
            deleted_offer_details = response.data[0] # Supabase returns the deleted record
            return jsonify({"status": "success", "message": f"Offer {offer_id} deleted", "deleted_offer": deleted_offer_details})
        else:
            check_exists = supabase.table('offers').select('id', count='exact').eq('id', offer_id).execute()
            if check_exists.count == 0:
                 return jsonify({"status": "error", "message": "Offer not found"}), 404
            else:
                return jsonify({"status": "error", "message": "Failed to delete offer from database"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to delete offer"}), 500

@app.route('/api/bg_image', methods=['GET'])
def get_bg_image():
    try:
        response = supabase.table('bgimage').select("id, image_url").order('created_at', desc=False).execute()
        if response.data:
            return jsonify(response.data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to fetch slideshow items"}), 500
@app.route('/api/bg_image/<int:bg_id>', methods=['PUT'])
def update_bg_image(bg_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    if not data or 'image_url' not in data:
        return jsonify({"status": "error", "message": "Missing image_url"}), 400
    try:
        image_url = str(data['image_url']).strip()
        if not image_url:
            return jsonify({"status": "error", "message": "Image URL cannot be empty"}), 400
        updated = supabase.table('bgimage').update({"image_url": image_url}).eq('id', bg_id).execute()
        if updated.data:
            return jsonify({"status": "success", "message": "Background image updated", "item": updated.data[0]})
        else:
            # Check if record exists
            exists = supabase.table('bgimage').select('id', count='exact').eq('id', bg_id).execute()
            if exists.count == 0:
                return jsonify({"status": "error", "message": "Background image not found"}), 404
            else:
                return jsonify({"status": "error", "message": "Failed to update background image"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to update background image"}), 500



@app.route('/api/daily_needs', methods=['GET'])
def get_daily_needs_items():
    try:
        response = supabase.table('daily_needs').select("id, image_url, price, created_at").order('created_at', desc=False).execute()
        if response.data:
            return jsonify(response.data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to fetch Daily Needs items"}), 500

@app.route('/api/daily_needs', methods=['POST'])
def add_daily_needs_item():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    if not data or 'image_url' not in data or 'price' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or price"}), 400
    try:
        image_url = str(data['image_url']).strip()
        price = str(data['price']).strip() # Store price as text
        if not image_url or not price:
             return jsonify({"status": "error", "message": "Image URL and Price cannot be empty"}), 400
        new_item_data = {
            "image_url": image_url,
            "price": price
        }
        response = supabase.table('daily_needs').insert(new_item_data).execute()

        if response.data:
            inserted_item = response.data[0]
            return jsonify({"status": "success", "message": "Daily Needs item added", "item": inserted_item}), 201
        else:
            return jsonify({"status": "error", "message": "Failed to add Daily Needs item to database"}), 500

    except (ValueError, TypeError) as e:
         return jsonify({"status": "error", "message": "Invalid data format"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to save Daily Needs item"}), 500

@app.route('/api/daily_needs/<int:item_id>', methods=['PUT'])
def update_daily_needs_item(item_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    if not data or 'image_url' not in data or 'price' not in data:
         return jsonify({"status": "error", "message": "Missing image_url or price"}), 400
    try:
        image_url = str(data['image_url']).strip()
        price = str(data['price']).strip()
        if not image_url or not price:
             return jsonify({"status": "error", "message": "Image URL and Price cannot be empty"}), 400
        updated_item_data = {
            "image_url": image_url,
            "price": price
        }
        response = supabase.table('daily_needs').update(updated_item_data).eq('id', item_id).execute()

        if response.data:
            updated_item = response.data[0]
            return jsonify({"status": "success", "message": f"Daily Needs item {item_id} updated", "item": updated_item})
        else:
            check_exists = supabase.table('daily_needs').select('id', count='exact').eq('id', item_id).execute()
            if check_exists.count == 0:
                 return jsonify({"status": "error", "message": "Daily Needs item not found"}), 404
            else:
                 return jsonify({"status": "error", "message": "Failed to update Daily Needs item in database"}), 500
    except (ValueError, TypeError) as e:
         return jsonify({"status": "error", "message": "Invalid data format"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to update Daily Needs item"}), 500
    
@app.route('/api/daily_needs/<int:item_id>', methods=['DELETE'])
def delete_daily_needs_item(item_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        response = supabase.table('daily_needs').delete().eq('id', item_id).execute()
        if response.data:
            deleted_item_details = response.data[0]
            return jsonify({"status": "success", "message": f"Daily Needs item {item_id} deleted", "deleted_item": deleted_item_details})
        else:
            check_exists = supabase.table('daily_needs').select('id', count='exact').eq('id', item_id).execute()
            if check_exists.count == 0:
                 return jsonify({"status": "error", "message": "Daily Needs item not found"}), 404
            else:
                return jsonify({"status": "error", "message": "Failed to delete Daily Needs item from database"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to delete Daily Needs item"}), 500

# =================== NEW TRENDING PRODUCTS & DAILY NEEDS (UNIFIED TABLE) ===================

@app.route('/api/trending_products', methods=['GET'])
def get_trending_products():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        filters = {"column_type": "trending"}
        print("Fetching trending products with filters:", filters)
        data = select_data("trending_and_daily_needs", filters)
        print("Trending products fetched from DB:", data)
        return jsonify(data)
    except Exception as e:
        print("Error fetching trending products:", e)
        return jsonify({"status": "error", "message": "Failed to fetch trending products"}), 500

@app.route('/api/trending_products', methods=['POST'])
def add_trending_product():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    print("Add trending product request data:", data)
    if not data or 'image_url' not in data or 'name' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or name"}), 400
    try:
        new_data = {
            "image_url": data['image_url'].strip(),
            "name": data['name'].strip(),
            "column_type": "trending"
        }
        inserted = insert_data("trending_and_daily_needs", new_data)
        return jsonify({"status": "success", "message": "Trending product added", "item": inserted}), 201
    except Exception as e:
        print("Error adding trending product:", e)
        return jsonify({"status": "error", "message": "Failed to add trending product"}), 500

@app.route('/api/trending_products/<int:item_id>', methods=['PUT'])
def update_trending_product(item_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    print(f"Update trending product {item_id} data:", data)
    if not data or 'image_url' not in data or 'name' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or name"}), 400
    try:
        updated = update_data(
            "trending_and_daily_needs",
            {"id": item_id, "column_type": "trending"},
            {"image_url": data['image_url'].strip(), "name": data['name'].strip()}
        )
        return jsonify({"status": "success", "message": "Trending product updated", "item": updated})
    except Exception as e:
        print(f"Error updating trending product {item_id}:", e)
        return jsonify({"status": "error", "message": "Failed to update trending product"}), 500

@app.route('/api/trending_products/<int:item_id>', methods=['DELETE'])
def delete_trending_product(item_id):
    print(f"Delete trending product {item_id} request")
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        deleted = delete_data(
            "trending_and_daily_needs",
            {"id": item_id, "column_type": "trending"}
        )
        return jsonify({"status": "success", "message": "Trending product deleted", "item": deleted})
    except Exception as e:
        print(f"Error deleting trending product {item_id}:", e)
        return jsonify({"status": "error", "message": "Failed to delete trending product"}), 500

# ------------------- DAILY NEEDS (from unified table) -------------------

@app.route('/api/daily_needs_items', methods=['GET'])
def get_daily_needs_items_new():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        filters = {"column_type": "daily needs"}
        print("Fetching daily needs with filters:", filters)
        data = select_data("trending_and_daily_needs", filters)
        return jsonify(data)
    except Exception as e:
        print("Error fetching daily needs:", e)
        return jsonify({"status": "error", "message": "Failed to fetch daily needs"}), 500

@app.route('/api/daily_needs_items', methods=['POST'])
def add_daily_needs_item_new():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    print("Add daily needs item request data:", data)
    if not data or 'image_url' not in data or 'name' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or name"}), 400
    try:
        new_data = {
            "image_url": data['image_url'].strip(),
            "name": data['name'].strip(),
            "column_type": "daily needs"
        }
        inserted = insert_data("trending_and_daily_needs", new_data)
        return jsonify({"status": "success", "message": "Daily needs item added", "item": inserted}), 201
    except Exception as e:
        print("Error adding daily needs item:", e)
        return jsonify({"status": "error", "message": "Failed to add daily needs item"}), 500

@app.route('/api/daily_needs_items/<int:item_id>', methods=['PUT'])
def update_daily_needs_item_new(item_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.get_json()
    print(f"Update daily needs item {item_id} data:", data)
    if not data or 'image_url' not in data or 'name' not in data:
        return jsonify({"status": "error", "message": "Missing image_url or name"}), 400
    try:
        updated = update_data(
            "trending_and_daily_needs",
            {"id": item_id, "column_type": "daily needs"},
            {"image_url": data['image_url'].strip(), "name": data['name'].strip()}
        )
        return jsonify({"status": "success", "message": "Daily needs item updated", "item": updated})
    except Exception as e:
        print(f"Error updating daily needs item {item_id}:", e)
        return jsonify({"status": "error", "message": "Failed to update daily needs item"}), 500

@app.route('/api/daily_needs_items/<int:item_id>', methods=['DELETE'])
def delete_daily_needs_item_new(item_id):
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        deleted = delete_data(
            "trending_and_daily_needs",
            {"id": item_id, "column_type": "daily needs"}
        )
        return jsonify({"status": "success", "message": "Daily needs item deleted", "item": deleted})
    except Exception as e:
        print(f"Error deleting daily needs item {item_id}:", e)
        return jsonify({"status": "error", "message": "Failed to delete daily needs item"}), 500


@app.route('/api/customer_analytics', methods=['GET'])
def get_customer_analytics():
    if 'admin_username' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        # Total users count
        total_users_resp = supabase.table('users').select('id', count='exact').execute()
        total_users = total_users_resp.count or 0

        # Premium users count
        premium_users_resp = supabase.table('users').select('id', count='exact').eq('is_premium', True).execute()
        premium_users = premium_users_resp.count or 0

        # New users in last 7 days
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)

        new_users_7_resp = supabase.table('users').select('id', count='exact').gte('created_at', seven_days_ago.isoformat()).execute()
        new_users_7 = new_users_7_resp.count or 0

        # New users in last 30 days
        new_users_30_resp = supabase.table('users').select('id', count='exact').gte('created_at', thirty_days_ago.isoformat()).execute()
        new_users_30 = new_users_30_resp.count or 0

        # Previous period calculations for trends
        prev_period_7_resp = supabase.table('users').select('id', count='exact').gte('created_at', sixty_days_ago.isoformat()).lt('created_at', thirty_days_ago.isoformat()).execute()
        prev_period_7 = prev_period_7_resp.count or 0

        # Calculate growth rates
        new_users_growth = calculate_growth_rate(new_users_7, prev_period_7)
        total_users_growth = 5  # Placeholder, typically calculated based on previous total
        premium_users_growth = 12  # Placeholder, typically calculated based on previous total

        # Premium conversion rate
        premium_conversion_rate = (premium_users / total_users * 100) if total_users > 0 else 0
        conversion_rate_change = 0  # Placeholder, typically calculated based on previous rate

        # Recent premium subscribers (last 5)
        recent_premium_resp = supabase.table('users').select('name', 'mobile', 'premium_start_at').eq('is_premium', True).order('premium_start_at', desc=True).limit(5).execute()
        recent_premium = recent_premium_resp.data if recent_premium_resp.data else []

        # Generate sample data for charts
        # In a real scenario, this would come from database queries
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        free_users = [50, 65, 75, 90, 100, 110]
        premium_users_data = [8, 12, 18, 22, 28, 35]

        return jsonify({
            "total_users": total_users,
            "premium_users": premium_users,
            "new_users_7_days": new_users_7,
            "new_users_30_days": new_users_30,
            "premium_conversion_rate": premium_conversion_rate,
            "recent_premium_subscribers": recent_premium,
            
            # Additional fields for UI
            "total_users_growth": total_users_growth,
            "premium_users_growth": premium_users_growth,
            "new_users_growth": new_users_growth,
            "conversion_rate_change": conversion_rate_change,
            
            # Chart data
            "growth_data": {
                "months": months,
                "free_users": free_users,
                "premium_users": premium_users_data
            }
        })
    except Exception as e:
        print("Error fetching customer analytics:", e)
        return jsonify({"status": "error", "message": "Failed to fetch customer analytics"}), 500
        
# Helper function for growth calculation
def calculate_growth_rate(current, previous):
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100)


def main():
    kill_ngrok_processes()
    ngrok.set_auth_token(os.getenv("NGROK_AUTH_TOKEN"))
    ngrok_tunnel = ngrok.connect(addr='5000', proto="http", hostname="noble-raven-entirely.ngrok-free.app")
    print("Public URL:", ngrok_tunnel.public_url)
    app.run(port=5000, debug=True, use_reloader=False)
    app.run(debug=True)

if __name__ == "__main__":
    main()



# the profile page number is not visible cause it needs verification.
# the dropdown suggestion system is ongoing should be finished by 6pm today. it'll take quite some space in database tho.
