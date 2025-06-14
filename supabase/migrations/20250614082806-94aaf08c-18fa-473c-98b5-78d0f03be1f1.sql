
-- Verificar el estado actual del perfil del usuario
SELECT id, subscription_tier, student_limit, stripe_status 
FROM public.profiles 
WHERE id = auth.uid();

-- Si el subscription_tier es NULL o 'starter' pero debería ser 'academy', podemos actualizarlo manualmente
-- UPDATE public.profiles 
-- SET subscription_tier = 'academy'
-- WHERE id = auth.uid() AND subscription_tier != 'academy';
