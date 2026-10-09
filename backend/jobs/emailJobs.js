import cron from 'node-cron';
import { query } from '../db/pool.js';
import { sendStreakReminder, sendWeeklyDigest } from '../services/emailService.js';
import { LESSONS, LESSON_ORDER } from '../content/index.js';

// Only users who (1) confirmed an email, (2) opted in, (3) are active ever get
// these. Each job records the date it last emailed someone so a restart or a
// second server instance can't double-send.

export async function runStreakReminders() {
  // It's 6pm-ish in the user's timezone, they have a streak, and haven't
  // practiced today.
  const { rows } = await query(
    `SELECT id, username, email, streak_current, email_unsubscribe_token
     FROM users
     WHERE is_active AND email_verified AND email IS NOT NULL AND email_opt_in
       AND streak_current >= 2
       AND EXTRACT(HOUR FROM NOW() AT TIME ZONE COALESCE(timezone, 'America/New_York')) = 18
       AND streak_last_day = (NOW() AT TIME ZONE COALESCE(timezone, 'America/New_York'))::date - 1
       AND (last_reminder_sent_on IS NULL OR last_reminder_sent_on < (NOW() AT TIME ZONE COALESCE(timezone, 'America/New_York'))::date)
     LIMIT 500`
  );
  for (const u of rows) {
    await query(
      `UPDATE users SET last_reminder_sent_on = (NOW() AT TIME ZONE COALESCE(timezone, 'America/New_York'))::date WHERE id = $1`,
      [u.id]
    );
    await sendStreakReminder(u, u.email, u.email_unsubscribe_token);
  }
  if (rows.length) console.log(`[emailJobs] sent ${rows.length} streak reminder(s)`);
  return rows.length;
}

export async function runWeeklyDigest() {
  const { rows } = await query(
    `SELECT u.id, u.username, u.email, u.streak_current, u.email_unsubscribe_token,
       (SELECT COALESCE(SUM(amount),0)::int FROM xp_events e WHERE e.user_id = u.id AND e.created_at > NOW() - INTERVAL '7 days') AS week_xp,
       (SELECT COUNT(*)::int FROM lesson_completions c WHERE c.user_id = u.id AND c.first_completed_at > NOW() - INTERVAL '7 days') AS week_lessons,
       (SELECT ARRAY_AGG(lesson_id) FROM lesson_completions c WHERE c.user_id = u.id) AS done
     FROM users u
     WHERE u.is_active AND u.email_verified AND u.email IS NOT NULL AND u.email_opt_in
       AND (u.last_digest_sent_on IS NULL OR u.last_digest_sent_on < CURRENT_DATE - 5)
     LIMIT 2000`
  );
  let sent = 0;
  for (const u of rows) {
    const done = new Set(u.done || []);
    // Skip people who did nothing this week and have never done anything:
    // emailing them is noise, and noisy senders land in spam.
    if (!u.week_xp && done.size === 0) continue;
    const nextId = LESSON_ORDER.find((id) => !done.has(id));
    await query('UPDATE users SET last_digest_sent_on = CURRENT_DATE WHERE id = $1', [u.id]);
    await sendWeeklyDigest(u, u.email, {
      weekXp: u.week_xp,
      lessonsThisWeek: u.week_lessons,
      streak: u.streak_current,
      totalLessons: done.size,
      lessonCount: LESSON_ORDER.length,
      nextLessonTitle: nextId ? LESSONS.get(nextId).lesson.title : null,
    }, u.email_unsubscribe_token);
    sent++;
  }
  if (sent) console.log(`[emailJobs] sent ${sent} weekly digest(s)`);
  return sent;
}

export function startEmailJobs() {
  // Hourly, on the hour: whoever is at 6pm local right now gets a reminder.
  cron.schedule('0 * * * *', () => runStreakReminders().catch((e) => console.error('[emailJobs] reminders:', e.message)));
  // Sundays 15:00 UTC (morning in the Americas, evening in Europe).
  cron.schedule('0 15 * * 0', () => runWeeklyDigest().catch((e) => console.error('[emailJobs] digest:', e.message)));
}

export default startEmailJobs;
