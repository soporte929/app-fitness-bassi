-- Plan nutricional del trainer
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Plan nutricional',
  kcal_target integer,
  protein_target_g numeric(6,1),
  carbs_target_g numeric(6,1),
  fat_target_g numeric(6,1),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Comidas del plan (definidas por el trainer)
CREATE TABLE IF NOT EXISTS nutrition_plan_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  kcal integer,
  protein_g numeric(6,1),
  carbs_g numeric(6,1),
  fat_g numeric(6,1),
  meal_time text,
  day_of_week text DEFAULT 'all',
  order_index integer DEFAULT 0
);

-- Check del cliente (qué comidas ha completado hoy)
CREATE TABLE IF NOT EXISTS nutrition_meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES nutrition_plan_meals(id) ON DELETE CASCADE,
  logged_date date DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  UNIQUE(client_id, meal_id, logged_date)
);

-- RLS
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_all_nutrition_plans" ON nutrition_plans
  FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "client_read_nutrition_plans" ON nutrition_plans
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY "trainer_all_plan_meals" ON nutrition_plan_meals
  FOR ALL USING (
    plan_id IN (
      SELECT id FROM nutrition_plans WHERE trainer_id = auth.uid()
    )
  );
CREATE POLICY "client_read_plan_meals" ON nutrition_plan_meals
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM nutrition_plans 
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  );
CREATE POLICY "client_own_meal_logs" ON nutrition_meal_logs
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );
