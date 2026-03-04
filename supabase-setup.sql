-- ═══════════════════════════════════════════════
-- Supabase : table pour l'app Thaïlande 2026
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autoriser la lecture/écriture publique (app privée entre amis)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
