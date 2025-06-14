
-- Verificar la estructura actual de la tabla academy_profiles
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'academy_profiles' AND table_schema = 'public';

-- Modificar la tabla para que id tenga valor por defecto (UUID)
ALTER TABLE public.academy_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
