export const TOTAL_QUESTIONS = 50;

// Answer key copied from the supplied quiz's QUESTIONS_BANK. Keep it on the server.
export const ANSWER_KEY = [1, 0, 2, 1, 2, 2, 0, 1, 1, 1, 1, 0, 1, 2, 0, 1, 0, 0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1];

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function validTeacherPassword(password, env) {
  return Boolean(env.TEACHER_PASSWORD) && typeof password === 'string' && password === env.TEACHER_PASSWORD;
}

export function calculateResult(rawAnswers) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
  const answerMap = new Map();
  for (const item of answers) {
    const qid = Number(item?.questionId);
    const selected = Number(item?.selectedOptionIndex);
    if (Number.isInteger(qid) && qid >= 1 && qid <= TOTAL_QUESTIONS && Number.isInteger(selected) && selected >= 0 && selected <= 3) {
      answerMap.set(qid, selected);
    }
  }
  let score = 0;
  const normalizedAnswers = [];
  const mistakeIds = [];
  for (let qid = 1; qid <= TOTAL_QUESTIONS; qid++) {
    const selected = answerMap.get(qid);
    const answered = Number.isInteger(selected);
    const isCorrect = answered && selected === ANSWER_KEY[qid - 1];
    if (isCorrect) score++;
    if (!isCorrect) mistakeIds.push(qid);
    normalizedAnswers.push({ questionId: qid, selectedOptionIndex: answered ? selected : null, isCorrect });
  }
  return { score, total: TOTAL_QUESTIONS, percentage: Math.round(score / TOTAL_QUESTIONS * 100), answers: normalizedAnswers, mistakeIds };
}

export async function getThreshold(env) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind('cert_threshold').first();
  const value = Number(row?.value);
  return Number.isFinite(value) && value >= 50 && value <= 100 ? value : 95;
}

function normalizedLog(row, attemptNumber) {
  return { id: row.id, name: row.name, timestamp: row.timestamp, score: Number(row.score), total: Number(row.total), percentage: Number(row.percentage), attemptNumber };
}

export function buildDashboard(rows, threshold) {
  // Rows arrive newest-first. Assign attempt numbers so older tries start at 1 and the latest is N.
  const totals = new Map();
  for (const row of rows) {
    const key = normalizeName(row.name).toLocaleLowerCase('ar');
    totals.set(key, (totals.get(key) || 0) + 1);
  }
  const logs = rows.map(row => {
    const key = normalizeName(row.name).toLocaleLowerCase('ar');
    const attemptNumber = totals.get(key) || 1;
    totals.set(key, Math.max(0, attemptNumber - 1));
    return normalizedLog(row, attemptNumber);
  });
  const missedStats = {};
  for (const row of rows) {
    let ids = [];
    try { ids = JSON.parse(row.mistake_ids_json || '[]'); } catch { ids = []; }
    for (const id of ids) { const key = String(id); missedStats[key] = (missedStats[key] || 0) + 1; }
  }
  return { logs, missedStats, threshold };
}
