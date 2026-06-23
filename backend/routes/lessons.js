import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/progress', async (req, res) => {
  try {
    const result = await query(
      'SELECT lesson_number, completed, completed_at, quiz_score FROM lesson_progress WHERE user_id = $1',
      [req.user.userId]
    );
    const progressMap = new Map(result.rows.map((r) => [r.lesson_number, r]));

    const progress = [];
    for (let i = 1; i <= 20; i++) {
      const row = progressMap.get(i);
      progress.push({
        lessonNumber: i,
        completed: row ? row.completed : false,
        completedAt: row ? row.completed_at : null,
        quizScore: row ? row.quiz_score : null,
      });
    }

    res.json(progress);
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
});

router.post('/:num/complete', async (req, res) => {
  try {
    const lessonNumber = Number(req.params.num);
    if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 20) {
      return res.status(400).json({ error: 'Lesson number must be between 1 and 20' });
    }

    const { quizScore } = req.body || {};

    await query(
      `INSERT INTO lesson_progress (user_id, lesson_number, completed, completed_at, quiz_score)
       VALUES ($1, $2, TRUE, NOW(), $3)
       ON CONFLICT (user_id, lesson_number)
       DO UPDATE SET completed = TRUE, completed_at = NOW(), quiz_score = $3`,
      [req.user.userId, lessonNumber, quizScore ?? null]
    );

    const result = await query(
      'SELECT lesson_number, completed, completed_at, quiz_score FROM lesson_progress WHERE user_id = $1',
      [req.user.userId]
    );
    const completedCount = result.rows.filter((r) => r.completed).length;

    res.json({
      message: 'Lesson marked complete',
      completedCount,
      totalCount: 20,
      completionPercentage: Math.round((completedCount / 20) * 100),
    });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Failed to mark lesson complete' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM lesson_progress WHERE user_id = $1 AND completed = TRUE ORDER BY completed_at DESC',
      [req.user.userId]
    );
    const completedCount = result.rows.length;

    res.json({
      completedCount,
      totalCount: 20,
      completionPercentage: Math.round((completedCount / 20) * 100),
      lastCompleted: result.rows[0] || null,
    });
  } catch (err) {
    console.error('Lesson stats error:', err);
    res.status(500).json({ error: 'Failed to fetch lesson stats' });
  }
});

export default router;
