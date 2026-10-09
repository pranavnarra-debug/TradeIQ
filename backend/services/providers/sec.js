// SEC EDGAR: free, public US-government data (no API key, no licence fee).
// Used for company profiles, fundamentals computed from 10-K/10-Q XBRL facts,
// and recent filings shown in place of a news feed.
//
// SEC fair-access rules: every request must send a User-Agent with contact
// info, and stay under 10 requests/second.
// https://www.sec.gov/os/accessing-edgar-data
import { config } from '../../config.js';

const TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
const FACTS_URL = (cik) => `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
const SUBMISSIONS_URL = (cik) => `https://data.sec.gov/submissions/CIK${cik}.json`;

const DAY = 24 * 60 * 60 * 1000;
const cache = new Map(); // url -> { at, data }

export function secUserAgent() {
  if (process.env.SEC_USER_AGENT) return process.env.SEC_USER_AGENT;
  const contact = config.site.contactEmail;
  return contact ? `${config.site.name} education app (${contact})` : null;
}

export function secEnabled() {
  return Boolean(secUserAgent());
}

// Simple spacing between requests keeps us well under 10/second.
let lastRequest = 0;
async function secFetch(url, ttl) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  const wait = Math.max(0, lastRequest + 150 - Date.now());
  lastRequest = Date.now() + wait;
  if (wait) await new Promise((r) => setTimeout(r, wait));
  const res = await fetch(url, {
    headers: { 'User-Agent': secUserAgent(), Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 404) {
    cache.set(url, { at: Date.now(), data: null });
    return null;
  }
  if (!res.ok) throw new Error(`SEC ${res.status} for ${url}`);
  const data = await res.json();
  cache.set(url, { at: Date.now(), data });
  if (cache.size > 300) cache.delete(cache.keys().next().value);
  return data;
}

async function cikFor(symbol) {
  const map = await secFetch(TICKERS_URL, DAY);
  const sym = symbol.replace('.', '-').toUpperCase();
  const row = Object.values(map || {}).find((r) => r.ticker === sym);
  return row ? { cik: String(row.cik_str).padStart(10, '0'), title: row.title } : null;
}

// ---------- XBRL helpers ----------

function units(facts, ns, tags) {
  for (const tag of tags) {
    const u = facts?.[ns]?.[tag]?.units;
    if (u) return Object.values(u)[0];
  }
  return null;
}

/**
 * Latest full-fiscal-year values (from 10-K filings), newest first, one per
 * period end. Companies switch tags over the years (e.g. "Revenues" vs
 * "RevenueFromContract..."), so every candidate tag is checked and the one
 * with the most recent fiscal year wins.
 */
function annual(facts, tags) {
  let best = [];
  for (const tag of tags) {
    const series = annualFor(facts, tag);
    if (series.length && (!best.length || series[0].end > best[0].end)) best = series;
  }
  return best;
}

function annualFor(facts, tag) {
  const rows = units(facts, 'us-gaap', [tag]);
  if (!rows) return [];
  const byEnd = new Map();
  for (const r of rows) {
    if (!r.form || !r.form.startsWith('10-K') || !r.start) continue;
    const days = (new Date(r.end) - new Date(r.start)) / DAY;
    if (days < 340 || days > 390) continue; // full-year duration only
    const prev = byEnd.get(r.end);
    if (!prev || r.filed > prev.filed) byEnd.set(r.end, r);
  }
  return [...byEnd.values()].sort((a, b) => (a.end < b.end ? 1 : -1));
}

/** Most recent balance-sheet (point-in-time) value from any 10-K/10-Q, across candidate tags. */
function latestInstant(facts, tags, ns = 'us-gaap') {
  let best = null;
  for (const tag of tags) {
    for (const r of units(facts, ns, [tag]) || []) {
      if (r.start || !r.form || !/^10-[KQ]/.test(r.form)) continue;
      if (!best || r.end > best.end || (r.end === best.end && r.filed > best.filed)) best = r;
    }
  }
  return best ? best.val : null;
}

const pick = (facts, tags) => annual(facts, tags)[0]?.val ?? null;
const growth = (facts, tags) => {
  const [a, b] = annual(facts, tags);
  return a && b && b.val > 0 ? (a.val - b.val) / Math.abs(b.val) : null;
};
const ratio = (a, b) => (a != null && b != null && b !== 0 ? a / b : null);

const REVENUE = ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet', 'RevenuesNetOfInterestExpense'];
const NET_INCOME = ['NetIncomeLoss', 'ProfitLoss'];

// ---------- public API ----------

export async function getProfile(symbol) {
  const id = await cikFor(symbol);
  if (!id) return { name: symbol, sector: null, industry: null, description: null, marketCap: null, employees: null, website: null };
  const sub = await secFetch(SUBMISSIONS_URL(id.cik), DAY);
  return {
    name: sub?.name || id.title,
    sector: sub?.sicDescription || null,
    industry: sub?.sicDescription || null,
    description: null,
    marketCap: null,
    employees: null,
    website: sub?.website || null,
    source: 'SEC EDGAR',
  };
}

/**
 * Fundamentals in the same units the strategy engine was written for:
 * fractions for ROE/margins/growth/yield, debt-to-equity as a percent.
 * `price` is needed for valuation ratios.
 */
export async function getFundamentals(symbol, price) {
  const id = await cikFor(symbol);
  if (!id) return { error: 'No SEC filings for this symbol (ETFs and funds have none)' };
  const data = await secFetch(FACTS_URL(id.cik), DAY / 2);
  const facts = data?.facts;
  if (!facts?.['us-gaap']) return { error: 'No financial statements available for this symbol' };

  const revenue = pick(facts, REVENUE);
  const netIncome = pick(facts, NET_INCOME);
  const grossProfit = pick(facts, ['GrossProfit']) ?? (revenue != null && pick(facts, ['CostOfGoodsAndServicesSold', 'CostOfRevenue']) != null
    ? revenue - pick(facts, ['CostOfGoodsAndServicesSold', 'CostOfRevenue']) : null);
  const operatingIncome = pick(facts, ['OperatingIncomeLoss']);
  const opCash = pick(facts, ['NetCashProvidedByUsedInOperatingActivities']);
  const capex = pick(facts, ['PaymentsToAcquirePropertyPlantAndEquipment']);
  const eps = pick(facts, ['EarningsPerShareDiluted', 'EarningsPerShareBasic']);
  const dps = pick(facts, ['CommonStockDividendsPerShareDeclared', 'CommonStockDividendsPerShareCashPaid']);

  const equity = latestInstant(facts, ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest']);
  const assets = latestInstant(facts, ['Assets']);
  const curAssets = latestInstant(facts, ['AssetsCurrent']);
  const curLiab = latestInstant(facts, ['LiabilitiesCurrent']);
  const cash = latestInstant(facts, ['CashAndCashEquivalentsAtCarryingValue']);
  const ltDebt = latestInstant(facts, ['LongTermDebtNoncurrent', 'LongTermDebt']);
  const stDebt = (latestInstant(facts, ['LongTermDebtCurrent']) || 0) + (latestInstant(facts, ['CommercialPaper', 'ShortTermBorrowings']) || 0);
  const totalDebt = ltDebt != null ? ltDebt + stDebt : null;
  const shares = latestInstant(facts, ['EntityCommonStockSharesOutstanding'], 'dei');

  const earningsGrowth = growth(facts, NET_INCOME);
  const trailingPE = price && eps > 0 ? price / eps : null;

  return {
    name: data.entityName || id.title,
    sector: null,
    marketCap: price && shares ? price * shares : null,
    trailingPE,
    forwardPE: null,
    pegRatio: trailingPE && earningsGrowth > 0 ? trailingPE / (earningsGrowth * 100) : null,
    priceToBook: price && shares && equity > 0 ? (price * shares) / equity : null,
    dividendYield: price && dps ? dps / price : null,
    payoutRatio: ratio(dps, eps),
    returnOnEquity: equity > 0 ? ratio(netIncome, equity) : null,
    returnOnAssets: ratio(netIncome, assets),
    debtToEquity: totalDebt != null && equity > 0 ? (totalDebt / equity) * 100 : null,
    currentRatio: ratio(curAssets, curLiab),
    quickRatio: null,
    profitMargins: ratio(netIncome, revenue),
    operatingMargins: ratio(operatingIncome, revenue),
    grossMargins: ratio(grossProfit, revenue),
    revenueGrowth: growth(facts, REVENUE),
    earningsGrowth,
    freeCashflow: opCash != null && capex != null ? opCash - capex : null,
    operatingCashflow: opCash,
    totalDebt,
    totalCash: cash,
    beta: null,
    targetMeanPrice: null,
    recommendationKey: null,
    source: 'SEC EDGAR (latest fiscal year)',
  };
}

const NEWSWORTHY = {
  '8-K': 'Current report (major event)',
  '10-K': 'Annual report',
  '10-Q': 'Quarterly report',
  'DEF 14A': 'Proxy statement (shareholder vote)',
  'S-1': 'Registration statement',
  'SC 13D': 'Major shareholder stake',
  '4': 'Insider trade report',
};

/** Recent SEC filings, shaped like news items for the Research page. */
export async function getFilings(symbol) {
  const id = await cikFor(symbol);
  if (!id) return [];
  const sub = await secFetch(SUBMISSIONS_URL(id.cik), 60 * 60 * 1000);
  const r = sub?.filings?.recent;
  if (!r) return [];
  const out = [];
  let insiders = 0;
  for (let i = 0; i < r.form.length && out.length < 10; i++) {
    const form = r.form[i];
    if (!NEWSWORTHY[form]) continue;
    if (form === '4' && ++insiders > 2) continue; // don't let insider forms drown everything out
    const acc = r.accessionNumber[i].replace(/-/g, '');
    out.push({
      title: `${NEWSWORTHY[form]} (Form ${form})`,
      publisher: 'SEC EDGAR',
      publishedAt: new Date(`${r.filingDate[i]}T12:00:00Z`).toISOString(),
      url: `https://www.sec.gov/Archives/edgar/data/${Number(id.cik)}/${acc}/${r.primaryDocument[i]}`,
    });
  }
  return out;
}

export default { getProfile, getFundamentals, getFilings, secEnabled };
