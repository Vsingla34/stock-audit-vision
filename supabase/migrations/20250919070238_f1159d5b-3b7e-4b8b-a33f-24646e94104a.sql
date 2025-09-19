-- Add some default locations to make the app functional
INSERT INTO public.locations (name, description, active) VALUES
  ('Default', 'Default location for items', true),
  ('Warehouse', 'Main warehouse location', true),
  ('Store 1', 'Retail store location 1', true),
  ('Store 2', 'Retail store location 2', true);