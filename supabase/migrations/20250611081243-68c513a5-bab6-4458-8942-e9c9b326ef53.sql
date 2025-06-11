
-- Add subscription columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
  ADD COLUMN IF NOT EXISTS stripe_status TEXT;

-- Add computed student_limit column: 20 for starter, 60 for academy
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_limit INTEGER
  GENERATED ALWAYS AS (
    CASE subscription_tier
      WHEN 'academy' THEN 60
      ELSE 20
    END
  ) STORED;
