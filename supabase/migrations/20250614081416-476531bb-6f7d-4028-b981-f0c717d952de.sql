
-- Migración: captura el estado actual de get_teacher_stats (sin fallback)
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
