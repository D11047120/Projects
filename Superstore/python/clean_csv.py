import pandas as pd

df = pd.read_csv("../data/superstore.csv" , encoding="windows-1252")

# converter datas
df['Order Date'] = pd.to_datetime(df['Order Date'])

# verificar nulos
print(df.isnull().sum())

# margem de lucro
df['profit_margin'] = df['Profit'] / df['Sales']

# ano e mês
df['year'] = df['Order Date'].dt.year
df['month'] = df['Order Date'].dt.month

#cria csv limpo
df.to_csv("../data/clean_superstore.csv", index=False)