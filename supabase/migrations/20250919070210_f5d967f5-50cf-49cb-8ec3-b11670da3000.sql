-- Add some default locations to make the app functional
INSERT INTO public.locations (id, name, description, active) VALUES
  ('loc_default', 'Default', 'Default location for items', true),
  ('loc_warehouse', 'Warehouse', 'Main warehouse location', true),
  ('loc_store_1', 'Store 1', 'Retail store location 1', true),
  ('loc_store_2', 'Store 2', 'Retail store location 2', true)
ON CONFLICT (id) DO NOTHING;