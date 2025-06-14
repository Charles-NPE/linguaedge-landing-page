
-- Actualizar la función get_teacher_stats para incluir student_limit
CREATE OR REPLACE FUNCTION public.get_teacher_stats()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select json_build_object(
    'totalStudents', public.count_teacher_students(auth.uid()),
    'student_limit', p.student_limit,
    'subscription_tier', p.subscription_tier
  )
  from public.profiles p
  where p.id = auth.uid();
$function$;

-- Asegurar que las políticas RLS de profiles permitan actualizaciones del service role
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Política para que usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Política especial para permitir que el service role actualice subscription_tier y stripe_status
CREATE POLICY "Service role can update profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
