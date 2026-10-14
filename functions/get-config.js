import { getThreshold, jsonResponse } from './_lib.js';
export async function onRequest(context) {
  if (!['GET', 'POST'].includes(context.request.method)) return jsonResponse({ error: 'Method not allowed' }, 405);
  try { return jsonResponse({ ok: true, threshold: await getThreshold(context.env) }); }
  catch (error) { console.error('get-config error:', error); return jsonResponse({ ok: true, threshold: 95 }); }
}
