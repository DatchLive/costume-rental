-- Replace size (text) with height_min / height_max (int, cm)
ALTER TABLE costumes DROP COLUMN IF EXISTS size;
ALTER TABLE costumes ADD COLUMN height_min int;
ALTER TABLE costumes ADD COLUMN height_max int;
