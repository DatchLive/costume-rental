-- rentals.status の CHECK 制約に 'returning' を追加する
ALTER TABLE public.rentals
  DROP CONSTRAINT IF EXISTS rentals_status_check;

ALTER TABLE public.rentals
  ADD CONSTRAINT rentals_status_check CHECK (status IN (
    'pending', 'approved', 'rejected', 'active', 'returning', 'returned', 'cancelled'
  ));
