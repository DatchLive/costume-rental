-- Drop per-costume rental day limits (platform-wide constants: min 2, max 14)
ALTER TABLE costumes DROP COLUMN IF EXISTS min_rental_days;
ALTER TABLE costumes DROP COLUMN IF EXISTS max_rental_days;
