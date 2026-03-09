ALTER TABLE public.nutrition_plans
ADD COLUMN diet_type text CHECK (diet_type IN ('A', 'B', 'C')),
    ADD COLUMN meals_count integer DEFAULT 3,
    ADD COLUMN is_template boolean DEFAULT false;