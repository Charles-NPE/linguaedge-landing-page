
-- Listar todos los triggers en la tabla profiles
SELECT tgname, pg_get_triggerdef(t.oid, true) as ddl
FROM pg_trigger t
WHERE t.tgrelid = 'public.profiles'::regclass
  AND NOT t.tgisinternal;
