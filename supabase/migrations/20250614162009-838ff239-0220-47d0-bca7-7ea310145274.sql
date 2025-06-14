
-- Remove the gen_random_uuid() default from academy_profiles.id
-- The id should be explicitly set to the user's ID, not auto-generated
ALTER TABLE public.academy_profiles 
ALTER COLUMN id DROP DEFAULT;

-- Clean up any orphaned rows that might have been created with random UUIDs
-- Keep only rows where id matches user_id (the correct ones)
DELETE FROM public.academy_profiles 
WHERE id != user_id;
