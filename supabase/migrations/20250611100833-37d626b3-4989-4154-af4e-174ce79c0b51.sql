
-- Force subscription columns migration
DO $$
BEGIN
  -- Add columns if missing
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
    ADD COLUMN IF NOT EXISTS stripe_status    TEXT;

  -- Add generated column for student_limit
  BEGIN
    ALTER TABLE public.profiles
      ADD COLUMN student_limit INT
      GENERATED ALWAYS AS (
        CASE
          WHEN subscription_tier = 'academy' THEN 60
          ELSE 20
        END
      ) STORED;
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, skip
    RAISE NOTICE 'Column student_limit already exists, skipping';
  END;
END$$;

-- Verify columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('subscription_tier','student_limit','stripe_status')
ORDER BY column_name;
