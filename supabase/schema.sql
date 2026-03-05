-- ============================================================
-- FITNESS BASSI — Schema completo
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- Enums
create type user_role     as enum ('trainer', 'client');
create type activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type goal          as enum ('deficit', 'maintenance', 'surplus');
create type phase         as enum ('deficit', 'maintenance', 'surplus');

-- ── Perfiles (extiende auth.users) ──────────────────────────
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null unique,
  full_name   text not null,
  role        user_role not null default 'client',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Clientes ────────────────────────────────────────────────
create table clients (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles on delete cascade,
  trainer_id       uuid not null references profiles on delete restrict,
  phase            phase not null default 'maintenance',
  goal             goal not null default 'maintenance',
  weight_kg        numeric(5,2) not null,
  body_fat_pct     numeric(4,1),
  activity_level   activity_level not null default 'moderate',
  daily_steps      int not null default 7000,
  target_weight_kg numeric(5,2),
  joined_date      date not null default current_date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Registro de peso ────────────────────────────────────────
create table weight_logs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients on delete cascade,
  weight_kg    numeric(5,2) not null,
  body_fat_pct numeric(4,1),
  notes        text,
  logged_at    timestamptz not null default now()
);

-- ── Medidas corporales ──────────────────────────────────────
create table measurements (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients on delete cascade,
  waist_cm    numeric(5,1),
  hip_cm      numeric(5,1),
  chest_cm    numeric(5,1),
  arm_cm      numeric(5,1),
  thigh_cm    numeric(5,1),
  measured_at timestamptz not null default now()
);

-- ── Planes de entrenamiento ─────────────────────────────────
create table workout_plans (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients on delete cascade,
  name          text not null,
  days_per_week int not null default 3,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Días del plan ───────────────────────────────────────────
create table workout_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references workout_plans on delete cascade,
  name        text not null,
  order_index int not null default 0
);

-- ── Ejercicios del día ──────────────────────────────────────
create table exercises (
  id           uuid primary key default gen_random_uuid(),
  day_id       uuid not null references workout_days on delete cascade,
  name         text not null,
  muscle_group text not null,
  target_sets  int not null default 3,
  target_reps  text not null default '8-10',
  target_rir   int not null default 2,
  order_index  int not null default 0,
  notes        text
);

-- ── Sesiones de entrenamiento ───────────────────────────────
create table workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients on delete cascade,
  day_id      uuid not null references workout_days on delete restrict,
  completed   boolean not null default false,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  notes       text
);

-- ── Series registradas ──────────────────────────────────────
create table set_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references workout_sessions on delete cascade,
  exercise_id uuid not null references exercises on delete restrict,
  set_number  int not null,
  weight_kg   numeric(6,2) not null,
  reps        int not null,
  rir         int not null,
  completed   boolean not null default true
);

-- ── Registro nutricional ────────────────────────────────────
create table nutrition_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients on delete cascade,
  meal_name   text not null,
  food_name   text not null,
  calories    int not null,
  protein_g   numeric(6,1) not null,
  carbs_g     numeric(6,1) not null,
  fat_g       numeric(6,1) not null,
  quantity_g  numeric(7,1),
  logged_at   timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index on weight_logs    (client_id, logged_at desc);
create index on measurements   (client_id, measured_at desc);
create index on workout_sessions (client_id, started_at desc);
create index on set_logs       (session_id);
create index on nutrition_logs (client_id, logged_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles         enable row level security;
alter table clients          enable row level security;
alter table weight_logs      enable row level security;
alter table measurements     enable row level security;
alter table workout_plans    enable row level security;
alter table workout_days     enable row level security;
alter table exercises        enable row level security;
alter table workout_sessions enable row level security;
alter table set_logs         enable row level security;
alter table nutrition_logs   enable row level security;

-- Profiles: cada usuario ve y edita su propio perfil
create policy "profiles_self" on profiles
  for all using (auth.uid() = id);

-- Entrenador ve todos sus clientes
create policy "trainer_sees_clients" on clients
  for all using (
    trainer_id = auth.uid()
    or profile_id = auth.uid()
  );

-- Cliente y su entrenador ven los datos de peso
create policy "weight_logs_access" on weight_logs
  for all using (
    client_id in (
      select id from clients
      where profile_id = auth.uid() or trainer_id = auth.uid()
    )
  );

-- Idem para el resto de tablas de datos del cliente
create policy "measurements_access" on measurements
  for all using (
    client_id in (
      select id from clients
      where profile_id = auth.uid() or trainer_id = auth.uid()
    )
  );

create policy "workout_plans_access" on workout_plans
  for all using (
    client_id in (
      select id from clients
      where profile_id = auth.uid() or trainer_id = auth.uid()
    )
  );

create policy "workout_days_access" on workout_days
  for all using (
    plan_id in (
      select wp.id from workout_plans wp
      join clients c on c.id = wp.client_id
      where c.profile_id = auth.uid() or c.trainer_id = auth.uid()
    )
  );

create policy "exercises_access" on exercises
  for all using (
    day_id in (
      select wd.id from workout_days wd
      join workout_plans wp on wp.id = wd.plan_id
      join clients c on c.id = wp.client_id
      where c.profile_id = auth.uid() or c.trainer_id = auth.uid()
    )
  );

create policy "sessions_access" on workout_sessions
  for all using (
    client_id in (
      select id from clients
      where profile_id = auth.uid() or trainer_id = auth.uid()
    )
  );

create policy "set_logs_access" on set_logs
  for all using (
    session_id in (
      select ws.id from workout_sessions ws
      join clients c on c.id = ws.client_id
      where c.profile_id = auth.uid() or c.trainer_id = auth.uid()
    )
  );

create policy "nutrition_logs_access" on nutrition_logs
  for all using (
    client_id in (
      select id from clients
      where profile_id = auth.uid() or trainer_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
