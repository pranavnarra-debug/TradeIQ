-- One-time gift requested by the site owner: 100,000 XP for the player "bear".
-- Recorded the same way the admin "Grant XP / coins" button records grants:
-- an xp_events row (so weekly and all-time boards agree) and an audit entry.
WITH target AS (SELECT id FROM users WHERE LOWER(username) = 'bear' AND NOT is_bot LIMIT 1),
ev AS (
  INSERT INTO xp_events (user_id, source, ref, amount)
  SELECT id, 'admin_grant', 'gift from the owner', 100000 FROM target
  RETURNING user_id
),
up AS (UPDATE users SET xp = xp + 100000 WHERE id IN (SELECT user_id FROM ev) RETURNING id)
INSERT INTO admin_audit_log (admin_user_id, target_user_id, action, details)
SELECT NULL, id, 'grant', '{"xp": 100000, "coins": 0, "note": "gift from the owner (migration 009)"}' FROM up;
