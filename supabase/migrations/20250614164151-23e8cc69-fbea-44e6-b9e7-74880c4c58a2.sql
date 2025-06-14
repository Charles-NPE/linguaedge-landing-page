
-- Add unique constraint on user_id to prevent duplicate academy profiles
-- This ensures each user can only have one academy profile
ALTER TABLE public.academy_profiles 
ADD CONSTRAINT academy_profiles_user_id_unique UNIQUE (user_id);
