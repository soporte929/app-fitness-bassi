-- Migración Phase 8: Módulo Nutrición -- 2026-03-09
-- Tablas nuevas: foods, food_equivalences, saved_dishes, meal_plan_items, food_log, client_measurements
-- NOTA: nutrition_plans ya existe — meal_plan_items hace referencia a ella. No recrear nutrition_plans.

-- ============================================================
-- 1. foods — catálogo de alimentos base
-- ============================================================
CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  kcal_per_100g numeric NOT NULL,
  protein_per_100g numeric NOT NULL,
  carbs_per_100g numeric NOT NULL,
  fat_per_100g numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. food_equivalences — alimentos intercambiables (ej: pollo ↔ atún)
-- ============================================================
CREATE TABLE IF NOT EXISTS food_equivalences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  equivalent_food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  factor numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. saved_dishes — platos compuestos guardados por el entrenador
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  kcal_per_100g numeric NOT NULL,
  protein_per_100g numeric NOT NULL,
  carbs_per_100g numeric NOT NULL,
  fat_per_100g numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. meal_plan_items — items de comidas en planes nutricionales
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  meal_number integer NOT NULL,
  food_id uuid REFERENCES foods(id),
  dish_id uuid REFERENCES saved_dishes(id),
  option_slot text,
  grams numeric NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meal_plan_items_food_or_dish CHECK (
    (food_id IS NOT NULL AND dish_id IS NULL) OR
    (food_id IS NULL AND dish_id IS NOT NULL)
  )
);

-- ============================================================
-- 5. food_log — registro diario del cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS food_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  food_id uuid REFERENCES foods(id),
  dish_id uuid REFERENCES saved_dishes(id),
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  grams numeric NOT NULL DEFAULT 100,
  meal_number integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. client_measurements — medidas corporales del cliente por fecha
-- ============================================================
CREATE TABLE IF NOT EXISTS client_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  measured_at date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric,
  body_fat_pct numeric,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Habilitar RLS en todas las tablas nuevas
-- ============================================================
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_equivalences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_measurements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies
-- ============================================================

-- foods: lectura pública (catálogo base accesible para todos)
CREATE POLICY "foods_read_all" ON foods FOR SELECT USING (true);

-- food_equivalences: lectura pública
CREATE POLICY "food_equivalences_read_all" ON food_equivalences FOR SELECT USING (true);

-- saved_dishes: el trainer solo ve sus propios platos; clientes ven los del trainer que les asignó un plan
CREATE POLICY "saved_dishes_trainer_manage" ON saved_dishes
  FOR ALL USING (auth.uid() = trainer_id);

-- meal_plan_items: acceso vía nutrition_plans (trainer que creó el plan)
CREATE POLICY "meal_plan_items_trainer_manage" ON meal_plan_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutrition_plans
      WHERE nutrition_plans.id = meal_plan_items.plan_id
        AND nutrition_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "meal_plan_items_client_read" ON meal_plan_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nutrition_plans
      JOIN clients ON clients.id = nutrition_plans.client_id
      WHERE nutrition_plans.id = meal_plan_items.plan_id
        AND clients.profile_id = auth.uid()
    )
  );

-- food_log: el cliente gestiona sus propios registros
CREATE POLICY "food_log_client_manage" ON food_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = food_log.client_id
        AND clients.profile_id = auth.uid()
    )
  );

-- Trainer puede leer food_log de sus clientes
CREATE POLICY "food_log_trainer_read" ON food_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = food_log.client_id
        AND clients.trainer_id = auth.uid()
    )
  );

-- client_measurements: el cliente gestiona sus propias medidas
CREATE POLICY "client_measurements_client_manage" ON client_measurements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_measurements.client_id
        AND clients.profile_id = auth.uid()
    )
  );

-- Trainer puede leer medidas de sus clientes
CREATE POLICY "client_measurements_trainer_read" ON client_measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_measurements.client_id
        AND clients.trainer_id = auth.uid()
    )
  );
