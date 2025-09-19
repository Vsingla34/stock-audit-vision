-- 1) Fix invalid status values: allow 'matched' instead of 'audited'
ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_status_check;

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_status_check
  CHECK (status = ANY (ARRAY['pending', 'matched', 'discrepancy']));

-- 2) Enable upsert by sku+location for closing stock and audited items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'inventory_items'
      AND indexname = 'uq_inventory_items_sku_location'
  ) THEN
    CREATE UNIQUE INDEX uq_inventory_items_sku_location
      ON public.inventory_items (sku, location);
  END IF;
END $$;