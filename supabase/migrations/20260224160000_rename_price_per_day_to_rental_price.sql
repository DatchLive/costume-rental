-- Rename price_per_day to rental_price (flat pricing model)
ALTER TABLE costumes RENAME COLUMN price_per_day TO rental_price;
