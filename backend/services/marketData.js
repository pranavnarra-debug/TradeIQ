import YahooFinance from 'yahoo-finance2';

// yahoo-finance2 v3 exports a class; an instance exposes quote/historical/quoteSummary/search etc.
// Schema validation logging is disabled because Yahoo's undocumented API occasionally returns
// fields that don't match the library's internal schema, which would otherwise spam the console
// on minor upstream changes without indicating an actual problem with our requests.
const yahooFinance = new YahooFinance({ validation: { logErrors: false, logOptionsErrors: false } });

const TTL = {
  quote: 15000, // 15s
  candles: 60000, // 1min
  profile: 300000, // 5min
  news: 120000, // 2min
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MarketDataService {
  constructor() {
    this.cache = new Map();
  }

  _cacheGet(key, ttlType) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const ttl = TTL[ttlType] ?? 15000;
    const isFresh = Date.now() - entry.timestamp < ttl;
    return { data: entry.data, isFresh };
  }

  _cacheSet(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Generic retry wrapper: 3 attempts, exponential backoff (1s, 2s, 4s).
   * On total failure, falls back to last cached value (marked stale) or an error object.
   */
  async _withRetry(cacheKey, ttlType, fn) {
    const fresh = this._cacheGet(cacheKey, ttlType);
    if (fresh && fresh.isFresh) {
      return fresh.data;
    }

    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await fn();
        this._cacheSet(cacheKey, result);
        return result;
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt); // 1s, 2s
        }
      }
    }

    console.error(`MarketDataService: all retries failed for ${cacheKey}:`, lastError?.message);

    const stale = this.cache.get(cacheKey);
    if (stale) {
      return { ...stale.data, stale: true };
    }
    return { error: 'Data temporarily unavailable' };
  }

  async getQuote(symbol) {
    const cacheKey = `quote:${symbol}`;
    return this._withRetry(cacheKey, 'quote', async () => {
      const q = await yahooFinance.quote(symbol);
      return {
        symbol: q.symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        volume: q.regularMarketVolume ?? null,
        marketCap: q.marketCap ?? null,
        open: q.regularMarketOpen ?? null,
        high: q.regularMarketDayHigh ?? null,
        low: q.regularMarketDayLow ?? null,
        previousClose: q.regularMarketPreviousClose ?? null,
        marketState: q.marketState ?? 'CLOSED',
      };
    });
  }

  async getCandles(symbol, period = '3mo', interval = '1d') {
    const cacheKey = `candles:${symbol}:${period}:${interval}`;
    return this._withRetry(cacheKey, 'candles', async () => {
      const period1 = this._periodToStartDate(period);
      const period2 = new Date();
      const result = await yahooFinance.chart(symbol, {
        period1,
        period2,
        interval,
      });
      const quotes = result.quotes || [];
      return quotes
        .filter((c) => c.close != null) // chart() can include trailing/leading null candles for non-trading periods
        .map((c) => ({
          date: c.date.toISOString().slice(0, 10),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        }));
    });
  }

  async getProfile(symbol) {
    const cacheKey = `profile:${symbol}`;
    return this._withRetry(cacheKey, 'profile', async () => {
      const result = await yahooFinance.quoteSummary(symbol, {
        modules: ['assetProfile', 'summaryDetail'],
      });
      const profile = result.assetProfile || {};
      const summary = result.summaryDetail || {};
      return {
        name: profile.longName ?? profile.shortName ?? symbol,
        sector: profile.sector ?? null,
        industry: profile.industry ?? null,
        description: profile.longBusinessSummary ?? null,
        marketCap: summary.marketCap ?? null,
        employees: profile.fullTimeEmployees ?? null,
        website: profile.website ?? null,
      };
    });
  }

  async getNews(symbol) {
    const cacheKey = `news:${symbol}`;
    return this._withRetry(cacheKey, 'news', async () => {
      const result = await yahooFinance.search(symbol, { newsCount: 10 });
      const news = result.news || [];
      return news.map((n) => ({
        title: n.title,
        publisher: n.publisher,
        publishedAt: n.providerPublishTime
          ? new Date(n.providerPublishTime * 1000).toISOString()
          : null,
        url: n.link,
      }));
    });
  }

  async getMultipleQuotes(symbols) {
    const results = await Promise.all(
      symbols.map((symbol) =>
        this.getQuote(symbol).catch((err) => ({
          symbol,
          error: err.message || 'Data temporarily unavailable',
        }))
      )
    );
    return results;
  }

  _periodToStartDate(period) {
    const now = new Date();
    const start = new Date(now);
    switch (period) {
      case '1mo':
        start.setMonth(start.getMonth() - 1);
        break;
      case '6mo':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case '3mo':
      default:
        start.setMonth(start.getMonth() - 3);
        break;
    }
    return start;
  }
}

export default new MarketDataService();
