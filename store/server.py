from flask import Flask , request , jsonify
import storeapp
from sql_connection import get_sql_connection

app = Flask(__name__)


connection = get_sql_connection()

@app.route("/tracker" , methods = ['GET'])
def tracker_func():
    products = storeapp.get_products(connection)
    response = jsonify(products)
    response.headers.add('Acess-Control-Allow-Origin','*')
    return response


if __name__ == "__main__":
    print("Starting Server")
    app.run(port=5000, debug=True)