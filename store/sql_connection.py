import mysql.connector


__con = None

def get_sql_connection():
    global __con
    if __con is None:
        __con = mysql.connector.connect(user='didasz', password='skrt',
                              host='localhost',
                              database='store')
    return __con

