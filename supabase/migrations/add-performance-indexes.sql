-- Phase 29: Performance Optimization
-- Índices en columnas frecuentemente filtradas
-- Idempotente: IF NOT EXISTS — seguro de re-ejecutar
-- CONCURRENTLY: sin bloqueo de writes en producción

-- Verificar índices existentes antes de crear (opcional, para diagnóstico):
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('client_measurements', 'workout_sessions', 'food_log', 'set_logs')
-- ORDER BY tablename, indexname;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_measurements_client_id
  ON public.client_measurements (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_client_id
  ON public.workout_sessions (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_client_id
  ON public.food_log (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_set_logs_session_id
  ON public.set_logs (session_id);
