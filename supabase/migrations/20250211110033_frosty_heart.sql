/*
  # Add avatar seed field
  
  1. Changes
    - Add avatar_seed column to user_stats table
    - Add function to generate random seed if not provided
    - Add trigger to set default seed on insert
*/

-- Add avatar_seed column
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS avatar_seed text;

-- Function to generate random seed
CREATE OR REPLACE FUNCTION generate_avatar_seed()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text[] := '{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to set default seed on insert if not provided
CREATE OR REPLACE FUNCTION set_default_avatar_seed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_seed IS NULL THEN
    NEW.avatar_seed := generate_avatar_seed();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_avatar_seed_trigger
  BEFORE INSERT ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_default_avatar_seed();

-- Update existing records with random seeds
UPDATE user_stats 
SET avatar_seed = generate_avatar_seed()
WHERE avatar_seed IS NULL;