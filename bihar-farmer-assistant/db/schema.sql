-- Bihar Farmer Assistant – production schema (PostgreSQL 16 + PostGIS)
-- The MVP server uses in-memory repositories with the same shapes; this schema is the
-- migration target. No Aadhaar, bank or identity numbers are stored anywhere.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CREATE EXTENSION IF NOT EXISTS vector;  -- Phase 2 semantic retrieval

-- ---------- Geography ----------
CREATE TABLE district (
  id            text PRIMARY KEY,               -- 'muzaffarpur'
  name_en       text NOT NULL,
  name_hi       text NOT NULL,
  agro_zone     text NOT NULL CHECK (agro_zone IN ('I','II','IIIA','IIIB')),
  hq_point      geography(Point, 4326) NOT NULL,
  boundary      geography(MultiPolygon, 4326)
);

CREATE TABLE block (
  id            serial PRIMARY KEY,
  district_id   text NOT NULL REFERENCES district(id),
  name_hi       text NOT NULL,
  name_en       text,
  boundary      geography(MultiPolygon, 4326),
  UNIQUE (district_id, name_hi)
);

-- Verified regional facts (crop patterns, risks) – only these may drive recommendations.
CREATE TABLE regional_fact (
  id            serial PRIMARY KEY,
  district_id   text REFERENCES district(id),
  block_id      int REFERENCES block(id),
  kind          text NOT NULL CHECK (kind IN ('major_crop','risk','soil','irrigation')),
  value         text NOT NULL,
  source_id     int NOT NULL,
  verified_at   date,
  verified_by   text
);

-- ---------- Farmers (consented, minimal) ----------
CREATE TABLE farmer (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name         text,
  preferred_lang       text NOT NULL CHECK (preferred_lang IN ('hi','bho','mai','mag','anp')),
  district_id          text REFERENCES district(id),
  block_id             int REFERENCES block(id),
  village              text,
  land_acres           numeric(7,2) CHECK (land_acres >= 0),
  irrigation           text CHECK (irrigation IN ('none','partial','full')),
  soil                 text,
  consent_storage_at   timestamptz NOT NULL,      -- row exists only with consent
  consent_images_at    timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz                -- soft delete, hard-purged after 30 days
);

CREATE TABLE crop (
  id        text PRIMARY KEY,                     -- 'paddy'
  name_hi   text NOT NULL,
  name_bho  text NOT NULL,
  spoken    text[] NOT NULL DEFAULT '{}',         -- dialect variants for NLU
  agmarknet_aliases text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE farmer_crop (
  farmer_id  uuid REFERENCES farmer(id) ON DELETE CASCADE,
  crop_id    text REFERENCES crop(id),
  season     text CHECK (season IN ('kharif','rabi','zaid','perennial')),
  area_acres numeric(7,2),
  PRIMARY KEY (farmer_id, crop_id, season)
);

-- ---------- Knowledge (RAG) ----------
CREATE TABLE source (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  url           text NOT NULL,
  publisher     text,
  authority     text NOT NULL CHECK (authority IN ('government','icar','sau','kvk','other'))
);

CREATE TABLE knowledge_entry (
  id               text PRIMARY KEY,
  category         text NOT NULL,
  crops            text[] NOT NULL DEFAULT '{}',
  stages           text[] NOT NULL DEFAULT '{}',
  zones            text[] NOT NULL DEFAULT '{}',
  seasons          text[] NOT NULL DEFAULT '{}',
  keywords         text[] NOT NULL DEFAULT '{}',
  title_hi         text NOT NULL,
  source_id        int NOT NULL REFERENCES source(id),
  review_status    text NOT NULL CHECK (review_status IN ('pending_expert_review','expert_reviewed','outdated')),
  always_expert    boolean NOT NULL DEFAULT false,
  last_checked     date NOT NULL,
  next_review_due  date
  -- embedding vector(1024)  -- Phase 2
);

CREATE TABLE knowledge_translation (
  entry_id  text REFERENCES knowledge_entry(id) ON DELETE CASCADE,
  lang      text NOT NULL,
  body      text NOT NULL,
  follow_ups text[] NOT NULL DEFAULT '{}',
  audio_url text,
  PRIMARY KEY (entry_id, lang)
);

CREATE TABLE content_review (
  id          serial PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('knowledge','scheme','expert_contact')),
  entity_id   text NOT NULL,
  status      text NOT NULL,
  reviewer    text NOT NULL,              -- qualified expert (name + designation)
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Schemes ----------
CREATE TABLE scheme (
  id              text PRIMARY KEY,
  level           text NOT NULL CHECK (level IN ('central','state')),
  name_hi         text NOT NULL,
  purpose_hi      text NOT NULL,
  eligibility_hi  text[] NOT NULL,
  documents_hi    text[] NOT NULL,
  benefit_hi      text NOT NULL,
  apply_hi        text[] NOT NULL,
  official_url    text NOT NULL,
  deadline_hi     text,
  status_hi       text,
  helpline_hi     text,
  tags            text[] NOT NULL DEFAULT '{}',
  requires_dbt    boolean NOT NULL DEFAULT false,
  verification    text NOT NULL CHECK (verification IN ('verified_official','secondary_source','status_uncertain')),
  checked_on      date NOT NULL,
  verification_note text
);

-- ---------- Market & weather (cached snapshots, never presented as live) ----------
CREATE TABLE mandi_price (
  id            bigserial PRIMARY KEY,
  district_name text NOT NULL,
  market        text NOT NULL,
  commodity     text NOT NULL,
  variety       text,
  arrival_date  date NOT NULL,                -- date reported by the mandi
  min_price     int NOT NULL,
  max_price     int NOT NULL,
  modal_price   int NOT NULL,
  fetched_at    timestamptz NOT NULL,         -- when we pulled it
  source        text NOT NULL DEFAULT 'agmarknet-ogd',
  UNIQUE (market, commodity, variety, arrival_date)
);
CREATE INDEX mandi_price_lookup ON mandi_price (commodity, arrival_date DESC);

CREATE TABLE mandi_market (
  name        text PRIMARY KEY,
  district_id text REFERENCES district(id),
  location    geography(Point, 4326)        -- for true nearest-market queries (ST_Distance)
);

CREATE TABLE weather_snapshot (
  district_id text REFERENCES district(id),
  provider    text NOT NULL,
  fetched_at  timestamptz NOT NULL,
  payload     jsonb NOT NULL,
  PRIMARY KEY (district_id, provider, fetched_at)
);

CREATE TABLE alert_delivery (
  id          bigserial PRIMARY KEY,
  farmer_id   uuid REFERENCES farmer(id) ON DELETE CASCADE,
  alert_id    text NOT NULL,
  channel     text NOT NULL CHECK (channel IN ('in_app','push','sms','ivr')),
  sent_at     timestamptz NOT NULL DEFAULT now(),
  delivered   boolean
);

-- ---------- Conversations (pseudonymous, short retention) ----------
CREATE TABLE conversation (
  id          uuid PRIMARY KEY,
  farmer_id   uuid REFERENCES farmer(id) ON DELETE SET NULL,
  lang        text NOT NULL,
  district_id text REFERENCES district(id),
  started_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE conversation_turn (
  id              bigserial PRIMARY KEY,
  conversation_id uuid REFERENCES conversation(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('farmer','assistant')),
  text            text NOT NULL,
  intent          text,
  answer_kind     text,
  confidence      text,
  source_ids      int[],
  created_at      timestamptz NOT NULL DEFAULT now()
);
-- Retention job: DELETE turns older than 90 days unless flagged for (consented) quality review.

-- ---------- Experts ----------
CREATE TABLE expert_contact (
  id          serial PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('kvk','block_office','university','extension_worker','fpo','expert')),
  name_hi     text NOT NULL,
  district_id text REFERENCES district(id),
  phone       text,
  address     text,
  location    geography(Point, 4326),
  verified_at date,                         -- shown to farmers ONLY when not null
  verified_by text
);

CREATE TABLE expert_referral (
  id              bigserial PRIMARY KEY,
  farmer_id       uuid REFERENCES farmer(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversation(id),
  expert_id       int REFERENCES expert_contact(id),
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Phase 2: crop images (consent required, auto-expiry)
CREATE TABLE crop_image (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    uuid REFERENCES farmer(id) ON DELETE CASCADE,
  object_key   text NOT NULL,
  consent_at   timestamptz NOT NULL,
  expires_at   timestamptz NOT NULL DEFAULT now() + interval '30 days',
  analysis     jsonb
);
