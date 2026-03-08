-- 衣装削除をトランザクションで実行する関数
-- 呼び出し元ユーザーがオーナーであることを確認してから削除する
CREATE OR REPLACE FUNCTION public.delete_costume(p_costume_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- オーナー確認
  IF NOT EXISTS (
    SELECT 1 FROM public.costumes
    WHERE id = p_costume_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- 取引中・申請中の確認
  IF EXISTS (
    SELECT 1 FROM public.rentals
    WHERE costume_id = p_costume_id
      AND status IN ('pending', 'approved', 'active', 'returning', 'returned')
  ) THEN
    RAISE EXCEPTION 'Cannot delete costume with active rentals';
  END IF;

  -- 関連データを削除（同一トランザクション）
  DELETE FROM public.favorites WHERE costume_id = p_costume_id;
  DELETE FROM public.costume_reviews WHERE costume_id = p_costume_id;
  DELETE FROM public.costumes WHERE id = p_costume_id;
END;
$$;
