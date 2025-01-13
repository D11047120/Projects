
from sql_connection import get_sql_connection

def get_products(connection):
    
    cursor = connection.cursor()

    query = ("SELECT products.products_id, products.name, products.unit_type_id , products.amount, unit.unit_name","FROM products inner join unit on products.unit_type_id=unit.unit_type_id")

    cursor.execute(query)

    lista = []

    for (products_id, name, unit_type_id, amount, unit_name) in cursor:
        lista.append(
                {
                    "products_id":products_id,
                    "name":name,
                    "unit_type_id":unit_type_id,
                    "amount": amount,
                    "unit_name":unit_name
                }
            )
    

    return lista

def insert_product(conncetion , product):
    cursor = connection.cursor()
    query = ("INSERT INTO products"
             "(name ,unit_type_id, amount, unit_name)"
             "VALUES (%s , %s, %s, %s)")
    data = (product ['name'], product ['unit_type_id'] , product ['amount'] ,product ['unit_name'])
    cursor.execute(query,data)
    connection.commit()
    
    return cursor.lastrowid

if __name__ == '__main__':
    connection = get_sql_connection()
    print(insert_product(connection , {
        "name":'chicken',
        "unit_type_id":'1',
        "amount": '100',
        "unit_name":'g'
    }))