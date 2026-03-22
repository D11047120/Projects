import sqlite3
import pandas as pd
import os

# Lê o CSV
df = pd.read_csv("../data/superstore.csv", encoding="windows-1252")

# Cria a base de dados
conn = sqlite3.connect("../sales.db")
df.to_sql("orders", conn, if_exists="replace", index=False)
conn.close()

print(f"Sucesso! Tabela 'orders' criada com {len(df)} linhas.")
