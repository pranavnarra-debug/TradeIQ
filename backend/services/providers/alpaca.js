// Alpaca Market Data API (free "Basic" plan: IEX feed).
// https://docs.alpaca.markets/docs/about-market-data-api
//
// Licence note: Alpaca's terms allow personal use by default. Showing the data
// to other people through your own app requires 30 days' written notice and
// Alpaca's consent. See docs/MARKET_DATA.md for the email to send.
//
// IEX is one exchange, so "volume" here is IEX volume only (a few percent of
// total market volume). Relative-volume comparisons still work because every
// bar uses the same feed.

const BASE = 'https://data.alpaca.markets/v2';

export function alpacaEnabled() {
  return Boolean(process.env.ALPACA_KEY_ID && process.env.ALPACA_SECRET_KEY);
}

async function alpaca(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries({ feed: process.env.ALPACA_FEED || 'iex', ...params }).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: {
      'APCA-API-KEY-ID': process.env.ALPACA_KEY_ID,
      'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Alpaca ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** US equity session from the clock in New York (exchange holidays not modeled). */
export function marketStateNow(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(now).map((p) => [p.type, p.value]));
  if (parts.weekday === 'Sat' || parts.weekday === 'Sun') return 'CLOSED';
  const t = (Number(parts.hour) % 24) + Number(parts.minute) / 60;
  if (t >= 4 && t < 9.5) return 'PRE';
  if (t >= 9.5 && t < 16) return 'REGULAR';
  if (t >= 16 && t < 20) return 'POST';
  return 'CLOSED';
}

function quoteFromSnapshot(symbol, s) {
  if (!s) return { symbol, error: 'No data for this symbol' };
  const price = s.latestTrade?.p ?? s.dailyBar?.c ?? null;
  const prev = s.prevDailyBar?.c ?? null;
  return {
    symbol,
    price,
    change: price != null && prev != null ? price - prev : null,
    changePercent: price != null && prev ? ((price - prev) / prev) * 100 : null,
    volume: s.dailyBar?.v ?? null,
    marketCap: null,
    open: s.dailyBar?.o ?? null,
    high: s.dailyBar?.h ?? null,
    low: s.dailyBar?.l ?? null,
    previousClose: prev,
    marketState: marketStateNow(),
    source: 'IEX via Alpaca',
  };
}

export async function getQuotes(symbols) {
  const data = await alpaca('/stocks/snapshots', { symbols: symbols.join(',') });
  return symbols.map((sym) => quoteFromSnapshot(sym, data[sym]));
}

export async function getQuote(symbol) {
  const [q] = await getQuotes([symbol]);
  if (q.error) throw new Error(q.error);
  return q;
}

export async function getCandles(symbol, start, interval = '1d') {
  const timeframe = interval === '1wk' ? '1Week' : '1Day';
  const out = [];
  let pageToken;
  do {
    // The free plan can't query the most recent 15 minutes, so stop the
    // request window just before that.
    const data = await alpaca('/stocks/bars', {
      symbols: symbol,
      timeframe,
      start: start.toISOString(),
      end: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
      adjustment: 'all',
      limit: 10000,
      page_token: pageToken,
    });
    for (const b of data.bars?.[symbol] || []) {
      out.push({ date: b.t.slice(0, 10), open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v });
    }
    pageToken = data.next_page_token;
  } while (pageToken && out.length < 5000);
  return out;
}

export default { alpacaEnabled, getQuote, getQuotes, getCandles, marketStateNow };
