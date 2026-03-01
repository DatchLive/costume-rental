-- costumes テーブルに学生料金カラムを追加
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS student_price int;
