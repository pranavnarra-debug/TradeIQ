-- AI rivals were imported with a big batch "joining" on the same first day.
-- Move each rival's entire history back by a random 0-21 days so signups
-- trickle in over about a month, while each rival's own timeline stays in
-- order (signup before lessons before fights).
CREATE TEMP TABLE rival_shift AS
  SELECT id AS user_id, (floor(random() * 22))::int AS days FROM users WHERE is_bot;

UPDATE users u SET created_at = u.created_at - make_interval(days => s.days),
                   last_login = u.last_login - make_interval(days => s.days),
                   streak_last_day = u.streak_last_day - s.days
  FROM rival_shift s WHERE u.id = s.user_id;
UPDATE ai_rivals t SET created_at = t.created_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE portfolios t SET created_at = t.created_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE lesson_completions t SET first_completed_at = t.first_completed_at - make_interval(days => s.days),
                                last_completed_at = t.last_completed_at - make_interval(days => s.days)
  FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE unit_exams t SET passed_at = t.passed_at - make_interval(days => s.days),
                        last_attempt_at = t.last_attempt_at - make_interval(days => s.days)
  FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE user_achievements t SET unlocked_at = t.unlocked_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE xp_events t SET created_at = t.created_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE coin_events t SET created_at = t.created_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE user_items t SET acquired_at = t.acquired_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE user_equipment t SET equipped_at = t.equipped_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE battles t SET started_at = t.started_at - make_interval(days => s.days),
                     finished_at = t.finished_at - make_interval(days => s.days)
  FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE quest_claims t SET claimed_at = t.claimed_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE activity_log t SET created_at = t.created_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;
UPDATE dungeon_progress t SET updated_at = t.updated_at - make_interval(days => s.days) FROM rival_shift s WHERE t.user_id = s.user_id;

DROP TABLE rival_shift;
