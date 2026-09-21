-- Triggers, functions and seed data that Drizzle cannot express.
--
-- Idempotent on purpose: re-run this file any time with `npm run db:functions`,
-- after `npm run db:migrate` has applied the generated table migrations.

-- ---------------------------------------------------------------------------
-- Force RLS
--
-- `enable row level security` (emitted by the generated migration) still lets
-- the table owner bypass every policy. Forcing it closes that hole, so a
-- direct owner-role connection is held to the same rules as the API.
-- ---------------------------------------------------------------------------

alter table allowed_emails force row level security;
alter table profiles      force row level security;
alter table categories    force row level security;
alter table transactions  force row level security;

-- handle_new_user() below is `security definer` and therefore runs as the
-- table owner, which `force` now subjects to policies. It fires from the
-- auth.users trigger where there is no JWT, so auth.uid() is NULL and the
-- owner-only policies would reject its inserts — breaking sign-up. These
-- policies let the bootstrap through and only ever match when there is no
-- authenticated user, so they grant nothing to a real session.
drop policy if exists "profiles bootstrap by definer" on profiles;
create policy "profiles bootstrap by definer"
  on profiles for insert
  to postgres
  with check ((select auth.uid()) is null);

drop policy if exists "categories bootstrap by definer" on categories;
create policy "categories bootstrap by definer"
  on categories for insert
  to postgres
  with check ((select auth.uid()) is null);

-- ---------------------------------------------------------------------------
-- Data API grants
--
-- The tables are created by Drizzle rather than through the dashboard, so the
-- API roles never received table privileges and every request failed with
-- "permission denied for table". RLS decides which *rows* are visible; these
-- grants decide whether the table is reachable at all — both are required.
--
-- Least privilege: `authenticated` gets DML on its own data (RLS confines it
-- to rows it owns), `anon` gets nothing, and the allowlist stays read-only.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on transactions to authenticated;
grant select, insert, update, delete on categories   to authenticated;
grant select, update                 on profiles     to authenticated;
grant select                         on allowed_emails to authenticated;

-- service_role bypasses RLS and is only used server-side.
grant all on transactions, categories, profiles, allowed_emails to service_role;

-- anon is pre-login only and must not read application data.
revoke all on transactions, categories, profiles, allowed_emails from anon;

-- ---------------------------------------------------------------------------
-- Allowlist seed
-- ---------------------------------------------------------------------------

insert into allowed_emails (email, note)
values ('ctibor.kovalcik@gmail.com', 'owner')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
  before update on transactions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- New-user bootstrap
--
-- Rejects sign-ups outside the allowlist at the database level, so a leaked
-- OAuth client still cannot create an account. Then creates the profile and
-- seeds a starter set of categories tuned for Slovenská sporiteľňa exports.
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from allowed_emails a where a.email = lower(new.email)) then
    raise exception 'Email % is not on the allowlist', new.email;
  end if;

  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(new.email),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into categories (user_id, name, bucket, keywords, is_income, is_transfer, sort_order)
  values
    -- Needs
    (new.id, 'Groceries',    'needs', array['potraviny','lidl','kaufland','tesco','billa','coop','jednota','fresh','terno'], false, false, 10),
    (new.id, 'Housing',      'needs', array['nájom','najom','rent','byt','hypoték','hypotek','mortgage'], false, false, 20),
    (new.id, 'Utilities',    'needs', array['energi','elektr','plyn','voda','vodárne','sse','zse','spp','veolia'], false, false, 30),
    (new.id, 'Telecom',      'needs', array['telekom','orange','o2','4ka','telefón','telefon','internet','účty za telefón'], false, false, 40),
    (new.id, 'Transport',    'needs', array['pohonné hmoty','pohonne hmoty','slovnaft','omv','shell','mol','benzin','dpb','zssk','mhd','bolt','uber'], false, false, 50),
    (new.id, 'Health',       'needs', array['lekáre','lekare','zdravot','poliklinik','dr.max','benu','pilulka','zdravotné poistenie'], false, false, 60),
    (new.id, 'Insurance',    'needs', array['poisťov','poistov','poistenie','allianz','kooperativa','generali','union'], false, false, 70),
    (new.id, 'Taxes & fees', 'needs', array['daň','dan','iné dane','sociálne poistenie','socialne poistenie','poplatok','finančná správa'], false, false, 80),
    (new.id, 'Debt payments','needs', array['splátk','splatk','úver','uver','kreditnej karty','financovanie'], false, false, 90),

    -- Wants
    (new.id, 'Dining out',   'wants', array['reštaur','restaur','kaviar','bistro','pizza','kebab','mcdonald','burger','bolt food','wolt','foodpanda'], false, false, 110),
    (new.id, 'Shopping',     'wants', array['móda','moda','oblečenie','zara','h&m','alza','nay','datart','ikea','notino','pepco','action'], false, false, 120),
    (new.id, 'Entertainment','wants', array['záľuby','zaluby','oddych','kino','divadlo','netflix','spotify','hbo','disney','steam','televízia a rádio','televizia'], false, false, 130),
    (new.id, 'Sport',        'wants', array['šport','sport','fitness','posilň','posiln','bazén','bazen','multisport'], false, false, 140),
    (new.id, 'Travel',       'wants', array['hotel','booking','airbnb','letenk','ryanair','wizz','cestov'], false, false, 150),

    -- Savings
    (new.id, 'Investments',  'savings', array['investíc','investic','investičné','finančné nástroje','etf','broker','xtb','degiro','trading'], false, false, 210),
    (new.id, 'Savings',      'savings', array['sporenie','sporiaci','úspor','uspor'], false, false, 220),
    (new.id, 'Pension',      'savings', array['dôchodk','dochodk','dss','doplnkové dôchodkové','ii. pilier','iii. pilier'], false, false, 230),

    -- Special
    (new.id, 'Income',       'savings', array['mzda','výplata','vyplata','plat','salary','odmena','príjmy','prijmy'], true,  false, 300),
    (new.id, 'Transfers',    'savings', array['prevod','prevody medzi vlastnými účtami','prevod na vlastný účet','vlastný účet','vlastny ucet'], false, true, 310),
    (new.id, 'Uncategorized','wants',   array[]::text[], false, false, 900)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Backfill
--
-- handle_new_user() only fires for NEW sign-ups. Anyone who signed in before
-- this file was first applied has no profile and no categories, so seed them
-- here. Safe to re-run: every insert is guarded by on conflict do nothing.
-- ---------------------------------------------------------------------------

do $$
declare
  u record;
begin
  for u in
    select id, email, raw_user_meta_data
    from auth.users
    where lower(email) in (select email from allowed_emails)
  loop
    insert into profiles (id, email, full_name, avatar_url)
    values (
      u.id,
      lower(u.email),
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;

    -- Only seed a user who has no categories at all, so a deliberately
    -- deleted starter category is not silently resurrected.
    if not exists (select 1 from categories c where c.user_id = u.id) then
      insert into categories (user_id, name, bucket, keywords, is_income, is_transfer, sort_order)
      select u.id, name, bucket::bucket_type, keywords, is_income, is_transfer, sort_order
      from (values
        ('Groceries','needs',array['potraviny','lidl','kaufland','tesco','billa','coop','jednota','fresh','terno'],false,false,10),
        ('Housing','needs',array['nájom','najom','rent','byt','hypoték','hypotek','mortgage'],false,false,20),
        ('Utilities','needs',array['energi','elektr','plyn','voda','vodárne','sse','zse','spp','veolia'],false,false,30),
        ('Telecom','needs',array['telekom','orange','o2','4ka','telefón','telefon','internet','účty za telefón'],false,false,40),
        ('Transport','needs',array['pohonné hmoty','pohonne hmoty','slovnaft','omv','shell','mol','benzin','dpb','zssk','mhd','bolt','uber'],false,false,50),
        ('Health','needs',array['lekáre','lekare','zdravot','poliklinik','dr.max','benu','pilulka','zdravotné poistenie'],false,false,60),
        ('Insurance','needs',array['poisťov','poistov','poistenie','allianz','kooperativa','generali','union'],false,false,70),
        ('Taxes & fees','needs',array['daň','dan','iné dane','sociálne poistenie','socialne poistenie','poplatok','finančná správa'],false,false,80),
        ('Debt payments','needs',array['splátk','splatk','úver','uver','kreditnej karty','financovanie'],false,false,90),
        ('Dining out','wants',array['reštaur','restaur','kaviar','bistro','pizza','kebab','mcdonald','burger','bolt food','wolt','foodpanda'],false,false,110),
        ('Shopping','wants',array['móda','moda','oblečenie','zara','h&m','alza','nay','datart','ikea','notino','pepco','action'],false,false,120),
        ('Entertainment','wants',array['záľuby','zaluby','oddych','kino','divadlo','netflix','spotify','hbo','disney','steam','televízia a rádio','televizia'],false,false,130),
        ('Sport','wants',array['šport','sport','fitness','posilň','posiln','bazén','bazen','multisport'],false,false,140),
        ('Travel','wants',array['hotel','booking','airbnb','letenk','ryanair','wizz','cestov'],false,false,150),
        ('Investments','savings',array['investíc','investic','investičné','finančné nástroje','etf','broker','xtb','degiro','trading'],false,false,210),
        ('Savings','savings',array['sporenie','sporiaci','úspor','uspor'],false,false,220),
        ('Pension','savings',array['dôchodk','dochodk','dss','doplnkové dôchodkové','ii. pilier','iii. pilier'],false,false,230),
        ('Income','savings',array['mzda','výplata','vyplata','plat','salary','odmena','príjmy','prijmy'],true,false,300),
        ('Transfers','savings',array['prevod','prevody medzi vlastnými účtami','prevod na vlastný účet','vlastný účet','vlastny ucet'],false,true,310),
        ('Uncategorized','wants',array[]::text[],false,false,900)
      ) as v(name,bucket,keywords,is_income,is_transfer,sort_order)
      on conflict (user_id, name) do nothing;
    end if;
  end loop;
end $$;
