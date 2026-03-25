-- Run this against your D1 database after creation:
--   wrangler d1 execute guestbook-db --file=schema.sql --remote
-- Or paste it into the D1 console in the Cloudflare dashboard.

CREATE TABLE IF NOT EXISTS entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL,
  edited_at   TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip           TEXT    PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL  -- unix timestamp of first request in window
);
