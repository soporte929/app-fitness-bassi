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
  active           boolean not null default true,
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
  client_id     uuid references clients on delete cascade,
  trainer_id    uuid not null references profiles on delete restrict,
  name          text not null,
  description   text,
  days_per_week int not null default 3,
  active        boolean not null default true,
  is_template   boolean not null default false,
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
create index on workout_plans  (trainer_id, active, is_template);
create index on workout_plans  (client_id, active);
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
    trainer_id = auth.uid()
    or client_id in (
      select id from clients
      where profile_id = auth.uid()
    )
  );

create policy "workout_days_access" on workout_days
  for all using (
    plan_id in (
      select wp.id from workout_plans wp
      left join clients c on c.id = wp.client_id
      where wp.trainer_id = auth.uid() or c.profile_id = auth.uid()
    )
  );

create policy "exercises_access" on exercises
  for all using (
    day_id in (
      select wd.id from workout_days wd
      join workout_plans wp on wp.id = wd.plan_id
      left join clients c on c.id = wp.client_id
      where wp.trainer_id = auth.uid() or c.profile_id = auth.uid()
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
-- FUNCIONES RPC: rutinas con estructura transaccional
-- ============================================================
create or replace function create_workout_plan_with_structure(
  p_trainer_id uuid,
  p_name text,
  p_description text,
  p_days_per_week int,
  p_is_template boolean,
  p_client_id uuid,
  p_days jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_day jsonb;
  v_day_id uuid;
  v_exercise jsonb;
  v_day_index int := 0;
  v_exercise_index int;
begin
  if auth.uid() is null or auth.uid() <> p_trainer_id then
    raise exception 'No autorizado';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'El nombre del plan es obligatorio';
  end if;

  if p_days_per_week < 1 or p_days_per_week > 7 then
    raise exception 'Días por semana fuera de rango';
  end if;

  if p_is_template and p_client_id is not null then
    raise exception 'Un template no puede tener cliente asignado';
  end if;

  if not p_is_template and p_client_id is null then
    raise exception 'Un plan de cliente requiere client_id';
  end if;

  if not p_is_template then
    if not exists (
      select 1
      from clients c
      where c.id = p_client_id and c.trainer_id = p_trainer_id and c.active = true
    ) then
      raise exception 'Cliente inválido para este entrenador';
    end if;

    update workout_plans
    set active = false
    where trainer_id = p_trainer_id
      and client_id = p_client_id
      and is_template = false
      and active = true;
  end if;

  insert into workout_plans (
    client_id,
    trainer_id,
    name,
    description,
    days_per_week,
    active,
    is_template
  )
  values (
    case when p_is_template then null else p_client_id end,
    p_trainer_id,
    btrim(p_name),
    nullif(btrim(coalesce(p_description, '')), ''),
    p_days_per_week,
    true,
    p_is_template
  )
  returning id into v_plan_id;

  if jsonb_typeof(p_days) <> 'array' then
    raise exception 'days debe ser un array';
  end if;

  for v_day in
    select value from jsonb_array_elements(p_days)
  loop
    insert into workout_days (plan_id, name, order_index)
    values (
      v_plan_id,
      coalesce(nullif(btrim(v_day->>'name'), ''), format('Día %s', v_day_index + 1)),
      v_day_index
    )
    returning id into v_day_id;

    v_exercise_index := 0;
    if jsonb_typeof(v_day->'exercises') = 'array' then
      for v_exercise in
        select value from jsonb_array_elements(v_day->'exercises')
      loop
        insert into exercises (
          day_id,
          name,
          muscle_group,
          target_sets,
          target_reps,
          target_rir,
          order_index,
          notes
        )
        values (
          v_day_id,
          coalesce(nullif(btrim(v_exercise->>'name'), ''), 'Ejercicio'),
          coalesce(nullif(btrim(v_exercise->>'muscle_group'), ''), 'Otro'),
          greatest(coalesce((v_exercise->>'target_sets')::int, 1), 1),
          coalesce(nullif(btrim(v_exercise->>'target_reps'), ''), '8-12'),
          least(greatest(coalesce((v_exercise->>'target_rir')::int, 2), 0), 5),
          v_exercise_index,
          nullif(btrim(coalesce(v_exercise->>'notes', '')), '')
        );
        v_exercise_index := v_exercise_index + 1;
      end loop;
    end if;

    v_day_index := v_day_index + 1;
  end loop;

  if v_day_index <> p_days_per_week then
    raise exception 'El número de días no coincide con days_per_week';
  end if;

  return v_plan_id;
end;
$$;

create or replace function update_workout_plan_with_structure(
  p_plan_id uuid,
  p_trainer_id uuid,
  p_name text,
  p_description text,
  p_days_per_week int,
  p_is_template boolean,
  p_client_id uuid,
  p_days jsonb,
  p_replace_structure boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan workout_plans%rowtype;
  v_day jsonb;
  v_day_id uuid;
  v_exercise jsonb;
  v_day_index int := 0;
  v_exercise_index int;
begin
  if auth.uid() is null or auth.uid() <> p_trainer_id then
    raise exception 'No autorizado';
  end if;

  select *
  into v_plan
  from workout_plans wp
  where wp.id = p_plan_id
  for update;

  if not found then
    raise exception 'Plan no encontrado';
  end if;

  if v_plan.trainer_id <> p_trainer_id then
    raise exception 'No autorizado para editar este plan';
  end if;

  if v_plan.is_template <> p_is_template then
    raise exception 'No se puede cambiar el tipo del plan';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'El nombre del plan es obligatorio';
  end if;

  if p_days_per_week < 1 or p_days_per_week > 7 then
    raise exception 'Días por semana fuera de rango';
  end if;

  if p_is_template and p_client_id is not null then
    raise exception 'Un template no puede tener cliente asignado';
  end if;

  if not p_is_template and p_client_id is null then
    raise exception 'Un plan de cliente requiere client_id';
  end if;

  if coalesce(v_plan.client_id::text, '') <> coalesce(p_client_id::text, '') then
    raise exception 'No se puede cambiar el cliente en edición';
  end if;

  if not p_is_template then
    if not exists (
      select 1
      from clients c
      where c.id = p_client_id and c.trainer_id = p_trainer_id and c.active = true
    ) then
      raise exception 'Cliente inválido para este entrenador';
    end if;

    if p_replace_structure and exists (
      select 1
      from workout_sessions ws
      join workout_days wd on wd.id = ws.day_id
      where wd.plan_id = p_plan_id
      limit 1
    ) then
      raise exception 'No se puede editar la estructura porque el plan ya tiene sesiones';
    end if;
  end if;

  update workout_plans
  set
    name = btrim(p_name),
    description = nullif(btrim(coalesce(p_description, '')), ''),
    days_per_week = p_days_per_week
  where id = p_plan_id;

  if p_replace_structure then
    if jsonb_typeof(p_days) <> 'array' then
      raise exception 'days debe ser un array';
    end if;

    delete from workout_days where plan_id = p_plan_id;

    for v_day in
      select value from jsonb_array_elements(p_days)
    loop
      insert into workout_days (plan_id, name, order_index)
      values (
        p_plan_id,
        coalesce(nullif(btrim(v_day->>'name'), ''), format('Día %s', v_day_index + 1)),
        v_day_index
      )
      returning id into v_day_id;

      v_exercise_index := 0;
      if jsonb_typeof(v_day->'exercises') = 'array' then
        for v_exercise in
          select value from jsonb_array_elements(v_day->'exercises')
        loop
          insert into exercises (
            day_id,
            name,
            muscle_group,
            target_sets,
            target_reps,
            target_rir,
            order_index,
            notes
          )
          values (
            v_day_id,
            coalesce(nullif(btrim(v_exercise->>'name'), ''), 'Ejercicio'),
            coalesce(nullif(btrim(v_exercise->>'muscle_group'), ''), 'Otro'),
            greatest(coalesce((v_exercise->>'target_sets')::int, 1), 1),
            coalesce(nullif(btrim(v_exercise->>'target_reps'), ''), '8-12'),
            least(greatest(coalesce((v_exercise->>'target_rir')::int, 2), 0), 5),
            v_exercise_index,
            nullif(btrim(coalesce(v_exercise->>'notes', '')), '')
          );
          v_exercise_index := v_exercise_index + 1;
        end loop;
      end if;

      v_day_index := v_day_index + 1;
    end loop;

    if v_day_index <> p_days_per_week then
      raise exception 'El número de días no coincide con days_per_week';
    end if;
  end if;

  return true;
end;
$$;

create or replace function clone_workout_plan_to_client(
  p_plan_id uuid,
  p_trainer_id uuid,
  p_client_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_plan workout_plans%rowtype;
  v_new_plan_id uuid;
  v_source_day workout_days%rowtype;
  v_new_day_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_trainer_id then
    raise exception 'No autorizado';
  end if;

  select *
  into v_source_plan
  from workout_plans wp
  where wp.id = p_plan_id
  for update;

  if not found then
    raise exception 'Template no encontrado';
  end if;

  if v_source_plan.trainer_id <> p_trainer_id or v_source_plan.is_template = false then
    raise exception 'El plan origen no es un template de este entrenador';
  end if;

  if v_source_plan.active = false then
    raise exception 'El template origen está inactivo';
  end if;

  if not exists (
    select 1
    from clients c
    where c.id = p_client_id and c.trainer_id = p_trainer_id and c.active = true
  ) then
    raise exception 'Cliente inválido para este entrenador';
  end if;

  update workout_plans
  set active = false
  where trainer_id = p_trainer_id
    and client_id = p_client_id
    and is_template = false
    and active = true;

  insert into workout_plans (
    client_id,
    trainer_id,
    name,
    description,
    days_per_week,
    active,
    is_template
  )
  values (
    p_client_id,
    p_trainer_id,
    v_source_plan.name,
    v_source_plan.description,
    v_source_plan.days_per_week,
    true,
    false
  )
  returning id into v_new_plan_id;

  for v_source_day in
    select *
    from workout_days wd
    where wd.plan_id = p_plan_id
    order by wd.order_index asc
  loop
    insert into workout_days (plan_id, name, order_index)
    values (v_new_plan_id, v_source_day.name, v_source_day.order_index)
    returning id into v_new_day_id;

    insert into exercises (
      day_id,
      name,
      muscle_group,
      target_sets,
      target_reps,
      target_rir,
      order_index,
      notes
    )
    select
      v_new_day_id,
      e.name,
      e.muscle_group,
      e.target_sets,
      e.target_reps,
      e.target_rir,
      e.order_index,
      e.notes
    from exercises e
    where e.day_id = v_source_day.id
    order by e.order_index asc;
  end loop;

  return v_new_plan_id;
end;
$$;

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
