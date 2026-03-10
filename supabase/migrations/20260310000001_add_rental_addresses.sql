-- 配送先住所テーブル
CREATE TABLE public.rental_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('renter', 'owner')),
  name text NOT NULL,
  postal_code text NOT NULL,
  address text NOT NULL,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (rental_id, role)
);

-- RLS
ALTER TABLE public.rental_addresses ENABLE ROW LEVEL SECURITY;

-- 取引当事者のみ閲覧可能
CREATE POLICY "rental_addresses_select" ON public.rental_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rentals
      WHERE rentals.id = rental_addresses.rental_id
        AND (rentals.renter_id = auth.uid() OR rentals.owner_id = auth.uid())
    )
  );

-- 借り手は自分の住所（role='renter'）を登録
CREATE POLICY "rental_addresses_insert_renter" ON public.rental_addresses
  FOR INSERT WITH CHECK (
    role = 'renter' AND
    EXISTS (
      SELECT 1 FROM public.rentals
      WHERE rentals.id = rental_addresses.rental_id
        AND rentals.renter_id = auth.uid()
    )
  );

-- 出品者は自分の住所（role='owner'）を登録
CREATE POLICY "rental_addresses_insert_owner" ON public.rental_addresses
  FOR INSERT WITH CHECK (
    role = 'owner' AND
    EXISTS (
      SELECT 1 FROM public.rentals
      WHERE rentals.id = rental_addresses.rental_id
        AND rentals.owner_id = auth.uid()
    )
  );

-- 自分が登録した住所のみ更新可能
CREATE POLICY "rental_addresses_update_renter" ON public.rental_addresses
  FOR UPDATE USING (
    role = 'renter' AND
    EXISTS (
      SELECT 1 FROM public.rentals
      WHERE rentals.id = rental_addresses.rental_id
        AND rentals.renter_id = auth.uid()
    )
  );

CREATE POLICY "rental_addresses_update_owner" ON public.rental_addresses
  FOR UPDATE USING (
    role = 'owner' AND
    EXISTS (
      SELECT 1 FROM public.rentals
      WHERE rentals.id = rental_addresses.rental_id
        AND rentals.owner_id = auth.uid()
    )
  );
