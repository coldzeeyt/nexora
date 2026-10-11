BEGIN;
CREATE TABLE IF NOT EXISTS velora_profiles (
 user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 avatar text NOT NULL DEFAULT '', public_profile boolean NOT NULL DEFAULT false,
 discoverable boolean NOT NULL DEFAULT true,
 message_policy text NOT NULL DEFAULT 'friends' CHECK(message_policy IN ('friends','everyone','nobody'))
);
CREATE TABLE IF NOT EXISTS velora_records (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 app text NOT NULL CHECK(app IN ('reson','luma','vexa','nuvio','plixo','forma','zento','orbi','mira','fluxa')),
 title text NOT NULL, description text NOT NULL DEFAULT '', payload jsonb NOT NULL DEFAULT '{}',
 published boolean NOT NULL DEFAULT false, revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS velora_record_owner ON velora_records(owner_id,app);
CREATE INDEX IF NOT EXISTS velora_record_public ON velora_records(app,updated_at DESC) WHERE published;
CREATE TABLE IF NOT EXISTS velora_assets (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name text NOT NULL, type text NOT NULL, bytes integer NOT NULL CHECK(bytes BETWEEN 1 AND 8388608),
 manifest jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS velora_asset_owner ON velora_assets(owner_id);
CREATE TABLE IF NOT EXISTS kivo_friends (
 sender uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recipient uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(sender,recipient), CHECK(sender<>recipient)
);
CREATE TABLE IF NOT EXISTS kivo_blocks (
 actor uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 target uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 PRIMARY KEY(actor,target), CHECK(actor<>target)
);
CREATE TABLE IF NOT EXISTS kivo_spaces (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title text NOT NULL, description text NOT NULL DEFAULT '', invite_hash text UNIQUE,
 invite_expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS kivo_space_members (
 space_id uuid NOT NULL REFERENCES kivo_spaces(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role text NOT NULL DEFAULT 'member' CHECK(role IN ('owner','moderator','member')),
 PRIMARY KEY(space_id,user_id)
);
CREATE TABLE IF NOT EXISTS kivo_conversations (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title text NOT NULL, kind text NOT NULL CHECK(kind IN ('dm','group','channel')),
 dm_key text UNIQUE, space_id uuid REFERENCES kivo_spaces(id) ON DELETE CASCADE,
 invite_hash text UNIQUE, invite_expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS kivo_members (
 conversation_id uuid NOT NULL REFERENCES kivo_conversations(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role text NOT NULL DEFAULT 'member' CHECK(role IN ('owner','moderator','member')),
 read_at timestamptz NOT NULL DEFAULT now(), hidden_at timestamptz,
 PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE IF NOT EXISTS kivo_messages (
 id uuid PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES kivo_conversations(id) ON DELETE CASCADE,
 author_id uuid REFERENCES users(id) ON DELETE SET NULL,
 body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kivo_messages_conversation ON kivo_messages(conversation_id,created_at DESC);
CREATE TABLE IF NOT EXISTS velora_reports (
 id uuid PRIMARY KEY, reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
 target_user uuid REFERENCES users(id) ON DELETE SET NULL,
 message_id uuid REFERENCES kivo_messages(id) ON DELETE SET NULL,
 record_id uuid REFERENCES velora_records(id) ON DELETE SET NULL,
 reason text NOT NULL, resolved boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
