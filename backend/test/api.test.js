// End-to-end API tests. Needs a running server + database:
//   npm run db:local   (terminal 1)
//   npm run migrate && npm run dev   (terminal 2)
//   npm test           (terminal 3)
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const uname = `t_${Date.now().toString(36)}`;
let cookie = '';
let access = '';

async function call(method, path, body, { auth = true, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && access ? { Authorization: `Bearer ${access}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, setCookie: set };
}

test('catalog is public, lessons are not', async () => {
  const cat = await call('GET', '/api/lessons/catalog', null, { auth: false });
  assert.equal(cat.status, 200);
  assert.ok(cat.data.totalLessons > 0);
  const id = cat.data.units[0].chapters[0].lessons[0].id;
  const lesson = await call('GET', `/api/lessons/lesson/${id}`, null, { auth: false });
  assert.equal(lesson.status, 401);
});

test('register validates input', async () => {
  let r = await call('POST', '/api/auth/register', { username: 'ab', password: 'longenough1', acceptTerms: true, confirmAge: true });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/auth/register', { username: uname, password: 'password', acceptTerms: true, confirmAge: true });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/auth/register', { username: uname, password: 'Correct horse 9', acceptTerms: false, confirmAge: true });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/auth/register', { username: uname, password: 'Correct horse 9', acceptTerms: true, confirmAge: true, website: 'spam' });
  assert.equal(r.status, 400);
});

let recovery;
test('register without email logs you in with an httpOnly cookie + recovery code', async () => {
  const r = await call('POST', '/api/auth/register', { username: uname, password: 'Correct horse 9', acceptTerms: true, confirmAge: true });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.ok(r.data.accessToken);
  assert.match(r.data.recoveryCode, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.match(r.setCookie, /HttpOnly/i);
  assert.match(r.setCookie, /SameSite=Strict/i);
  assert.equal(r.data.user.email, null);
  access = r.data.accessToken;
  recovery = r.data.recoveryCode;
  const dup = await call('POST', '/api/auth/register', { username: uname.toUpperCase(), password: 'Correct horse 9', acceptTerms: true, confirmAge: true });
  assert.equal(dup.status, 409);
});

test('refresh rotates the cookie; cross-site refresh is blocked', async () => {
  const bad = await call('POST', '/api/auth/refresh', null, { auth: false, headers: { Origin: 'https://evil.example' } });
  assert.equal(bad.status, 403);
  const before = cookie;
  const r = await call('POST', '/api/auth/refresh', null, { auth: false });
  assert.equal(r.status, 200);
  assert.ok(r.data.accessToken);
  assert.notEqual(cookie, before);
  access = r.data.accessToken;
});

test('lesson completion is graded server-side and awards XP once', async () => {
  const cat = (await call('GET', '/api/lessons/catalog')).data;
  const id = cat.units[0].chapters[0].lessons[0].id;
  const lesson = (await call('GET', `/api/lessons/lesson/${id}`)).data;
  const quiz = lesson.steps[lesson.steps.length - 1];
  const wrong = quiz.questions.map((q) => (q.answer + 1) % q.options.length);
  let r = await call('POST', `/api/lessons/lesson/${id}/complete`, { answers: wrong });
  assert.equal(r.data.passed, false);
  assert.equal(r.data.xpGained, 0);
  const right = quiz.questions.map((q) => q.answer);
  r = await call('POST', `/api/lessons/lesson/${id}/complete`, { answers: right });
  assert.equal(r.data.passed, true);
  assert.equal(r.data.score, 100);
  assert.ok(r.data.xpGained >= 50);
  assert.equal(r.data.streak.streak, 1);
  assert.ok(r.data.newAchievements.some((a) => a.id === 'first_lesson'));
  r = await call('POST', `/api/lessons/lesson/${id}/complete`, { answers: right });
  assert.equal(r.data.xpGained, 0, 'no double XP for a repeat');
  const prog = (await call('GET', '/api/lessons/progress')).data;
  assert.equal(prog.completions[id].score, 100);
});

test('exam is locked until the unit is finished', async () => {
  const r = await call('GET', '/api/lessons/exam/money');
  assert.equal(r.status, 403);
});

test('trade inputs are validated', async () => {
  const pf = (await call('GET', '/api/portfolio')).data;
  const manual = pf.find((p) => p.portfolioType === 'manual');
  let r = await call('POST', `/api/portfolio/${manual.portfolioId}/trade`, { symbol: 'AAPL; DROP', action: 'BUY', quantity: 1 });
  assert.equal(r.status, 400);
  r = await call('POST', `/api/portfolio/${manual.portfolioId}/trade`, { symbol: 'AAPL', action: 'BUY', quantity: 1.5 });
  assert.equal(r.status, 400);
  r = await call('POST', `/api/portfolio/${manual.portfolioId}/trade`, { symbol: 'AAPL', action: 'BUY', quantity: -5 });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/portfolio/999999/trade', { symbol: 'AAPL', action: 'BUY', quantity: 1 });
  assert.ok([404, 503].includes(r.status));
});

test('non-admins cannot reach admin routes', async () => {
  const r = await call('GET', '/api/admin/db/tables');
  assert.equal(r.status, 403);
});

test('recovery code resets the password and is single-use', async () => {
  let r = await call('POST', '/api/auth/recover', { username: uname, recoveryCode: 'AAAA-BBBB-CCCC-DDDD', password: 'New pass word 2' }, { auth: false });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/auth/recover', { username: uname, recoveryCode: recovery.toLowerCase(), password: 'New pass word 2' }, { auth: false });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.notEqual(r.data.recoveryCode, recovery);
  r = await call('POST', '/api/auth/recover', { username: uname, recoveryCode: recovery, password: 'Another pass 3' }, { auth: false });
  assert.equal(r.status, 400);
  r = await call('POST', '/api/auth/login', { username: uname, password: 'New pass word 2' }, { auth: false });
  assert.equal(r.status, 200);
  access = r.data.accessToken;
});

test('optional email can be added; export and delete work', async () => {
  let r = await call('PUT', '/api/me/email', { email: `${uname}@example.com` });
  assert.equal(r.status, 200);
  assert.equal(r.data.emailVerified, false);
  r = await call('GET', '/api/me/export');
  assert.equal(r.status, 200);
  assert.equal(r.data.account.username, uname);
  assert.ok(!JSON.stringify(r.data).includes('password_hash'));
  r = await call('DELETE', '/api/me', { password: 'wrong', confirm: 'DELETE' });
  assert.equal(r.status, 401);
  r = await call('DELETE', '/api/me', { password: 'New pass word 2', confirm: 'DELETE' });
  assert.equal(r.status, 200);
  r = await call('POST', '/api/auth/login', { username: uname, password: 'New pass word 2' }, { auth: false });
  assert.equal(r.status, 401);
});

test('unit exam: unlocks after every lesson, grades server-side, pays out once', async () => {
  const r0 = await call('POST', '/api/auth/register', { username: `${uname}x`, password: 'Correct horse 9', acceptTerms: true, confirmAge: true }, { auth: false });
  access = r0.data.accessToken;
  const cat = (await call('GET', '/api/lessons/catalog')).data;
  const unit = cat.units.find((u) => u.id === 'futures');
  for (const ch of unit.chapters) {
    for (const l of ch.lessons) {
      const lesson = (await call('GET', `/api/lessons/lesson/${l.id}`)).data;
      const quiz = lesson.steps[lesson.steps.length - 1];
      const r = await call('POST', `/api/lessons/lesson/${l.id}/complete`, { answers: quiz.questions.map((q) => q.answer) });
      assert.equal(r.data.passed, true);
    }
  }
  const exam = (await call('GET', '/api/lessons/exam/futures')).data;
  assert.ok(exam.token && exam.questions.length >= 10);
  assert.ok(!('answer' in exam.questions[0]), 'answers must not be sent to the client');

  // Tampered token is rejected
  let bad = await call('POST', '/api/lessons/exam/futures', { token: `${exam.token}x`, answers: exam.questions.map(() => 0) });
  assert.equal(bad.status, 400);
  // Wrong unit is rejected
  bad = await call('POST', '/api/lessons/exam/money', { token: exam.token, answers: exam.questions.map(() => 0) });
  assert.equal(bad.status, 400);

  // Fail first (all option 0 is very unlikely to pass), then learn the right answers from the review and pass.
  const first = (await call('POST', '/api/lessons/exam/futures', { token: exam.token, answers: exam.questions.map(() => 0) })).data;
  assert.equal(first.results.length, exam.questions.length);
  const pass = (await call('POST', '/api/lessons/exam/futures', { token: exam.token, answers: first.results.map((x) => x.correctIndex) })).data;
  assert.equal(pass.score, 100);
  assert.equal(pass.passed, true);
  assert.ok(pass.xpGained >= 200);
  assert.ok(pass.newAchievements.some((a) => a.id === 'unit_futures'));
  const again = (await call('POST', '/api/lessons/exam/futures', { token: exam.token, answers: first.results.map((x) => x.correctIndex) })).data;
  assert.equal(again.xpGained, 0, 'exam XP is only paid once');
  await call('DELETE', '/api/me', { password: 'Correct horse 9', confirm: 'DELETE' });
});

test('limit orders cannot be used to print money', async () => {
  const r0 = await call('POST', '/api/auth/register', { username: `${uname}y`, password: 'Correct horse 9', acceptTerms: true, confirmAge: true }, { auth: false });
  access = r0.data.accessToken;
  const pf = (await call('GET', '/api/portfolio')).data.find((p) => p.portfolioType === 'manual');
  const r = await call('POST', `/api/portfolio/${pf.portfolioId}/trade`, { symbol: 'AAPL', action: 'BUY', quantity: 100, orderType: 'limit', limitPrice: 0.01 });
  // Either rejected as non-marketable, or market data is offline (503). It must never fill at $0.01.
  assert.ok([400, 503].includes(r.status), `got ${r.status}`);
  const after = (await call('GET', '/api/portfolio')).data.find((p) => p.portfolioType === 'manual');
  assert.equal(after.cash, 50000);
  await call('DELETE', '/api/me', { password: 'Correct horse 9', confirm: 'DELETE' });
});

test('hideout: starter kit, appearance validation, shop guards', async () => {
  const r0 = await call('POST', '/api/auth/register', { username: `${uname}g`, password: 'Correct horse 9', acceptTerms: true, confirmAge: true }, { auth: false });
  access = r0.data.accessToken;
  const cat = (await call('GET', '/api/game/catalog', null, { auth: false })).data;
  assert.ok(cat.items.length > 0 && cat.appearance.skin.length > 0);
  let st = (await call('GET', '/api/game/state')).data;
  const starters = cat.items.filter((i) => i.unlockKind === 'starter');
  assert.equal(st.inventory.length, starters.length, 'starter kit granted');
  assert.equal(Object.keys(st.equipment).length, starters.length, 'starter kit equipped');
  st = (await call('GET', '/api/game/state')).data;
  assert.equal(st.inventory.length, starters.length, 'starter kit only granted once');

  let r = await call('PUT', '/api/game/appearance', { hairStyle: 'mohawk', skin: cat.appearance.skin[0] });
  assert.equal(r.data.appearance.hairStyle, 'mohawk');
  r = await call('PUT', '/api/game/appearance', { skin: '#00ff00' });
  assert.equal(r.status, 400);

  const shopItem = cat.items.find((i) => i.unlockKind === 'shop' && i.world === 1 && i.price > 0);
  if (shopItem) {
    r = await call('POST', '/api/game/buy', { itemId: shopItem.id });
    assert.equal(r.status, 400, 'new players cannot afford it');
    assert.match(r.data.error, /more coins/);
  }
  const lockedItem = cat.items.find((i) => i.unlockKind === 'shop' && i.world > 1);
  if (lockedItem) {
    r = await call('POST', '/api/game/buy', { itemId: lockedItem.id });
    assert.equal(r.status, 403, 'later worlds are locked until you learn');
  }
  r = await call('PUT', '/api/game/equip', { slot: 'helmet', itemId: starters.find((i) => i.slot !== 'helmet').id });
  assert.equal(r.status, 400);
  if (shopItem) {
    r = await call('PUT', '/api/game/equip', { slot: shopItem.slot, itemId: shopItem.id });
    assert.equal(r.status, 403, "can't equip what you don't own");
  }
  await call('DELETE', '/api/me', { password: 'Correct horse 9', confirm: 'DELETE' });
});
