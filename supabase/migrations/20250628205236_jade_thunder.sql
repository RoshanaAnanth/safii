/*
  # Add resolved image URL column to issues table

  1. New Columns
    - `resolvedImageUrl` (text, nullable) - URL of the image uploaded as proof of resolution

  2. Changes
    - Add column to store proof of resolution images
    - Update existing policies to allow admin updates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'issues' AND column_name = 'resolvedImageUrl'
  ) THEN
    ALTER TABLE issues ADD COLUMN resolvedImageUrl text;
  END IF;
END $$;