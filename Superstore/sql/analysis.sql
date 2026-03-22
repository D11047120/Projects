#Total Sales by category

SELECT Category, SUM(Sales) AS total_sales
FROM orders
GROUP BY Category
ORDER BY total_sales DESC;



#Top 10 Customers

SELECT [Customer Name], SUM(Sales) AS total_spent
FROM orders
GROUP BY [Customer Name]
ORDER BY total_spent DESC
LIMIT 10;

#Monthly sales

SELECT strftime('%Y-%m', [Order Date]) AS month, 
       SUM(Sales) AS total_sales
FROM orders
GROUP BY month;