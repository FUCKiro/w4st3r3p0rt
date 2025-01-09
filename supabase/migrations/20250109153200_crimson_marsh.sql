/*
  # Create waste monitoring schema
  
  1. New Tables
    - waste_reports
      - id (uuid, primary key)
      - user_id (uuid, foreign key to auth.users)
      - latitude (double precision)
      - longitude (double precision)
      - waste_type (smallint)
      - size (smallint)
      - notes (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS on waste_reports table
    - Add policies for:
      - Viewing reports (all authenticated users)
      - Creating reports (authenticated users, own reports only)
*/

-- Create the waste_reports table
CREATE TABLE IF NOT EXISTS waste_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  waste_type smallint NOT NULL,
  size smallint NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view reports"
  ON waste_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reports"
  ON waste_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waste_reports_updated_at
  BEFORE UPDATE ON waste_reports
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();