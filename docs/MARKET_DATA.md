# Market data: what TradeIQ can legally use

_Researched October 2026. Licence terms change; re-check before you monetize._

## The short version

There is no free stock-price API whose free tier lets you show its data to the public in your own app without permission. Free tiers are "personal, non-commercial" use. What TradeIQ can use:

| Source | Cost | What it gives | Can we show it to users? |
|---|---|---|---|
| **SEC EDGAR APIs** (`data.sec.gov`) | Free, no key | Official company financials from 10-K/10-Q filings (revenue, earnings, debt, equity, cash flow, EPS, shares) | **Yes.** US government data. Must send a User-Agent with contact info and stay under 10 requests/second |
| **US Treasury / FRED** | Free | Interest rates, Treasury yields, inflation (CPI) | Treasury data: yes. FRED: most series yes, some third-party series are copyrighted (check each series) |
| **Alpaca Basic** | Free (needs an Alpaca account) | Real-time IEX quotes and historical bars back to 2016 | **Only with Alpaca's written consent.** Their terms limit use to personal/non-commercial unless you give 30 days' written notice for "making the Services and Content available to others through your own application" |
| **Marketstack Basic** | ~$9.99/mo | End-of-day + US intraday, 10 years of history, 10,000 requests/month | **Yes.** Plan explicitly includes commercial use |
| Finnhub, Twelve Data, Alpha Vantage, Massive (Polygon) free tiers | Free | Various | **No.** Personal/non-commercial only; public-display plans start around $499/mo (Twelve Data) to $2,499/mo (Massive) |
| Yahoo Finance via `yahoo-finance2` (what TradeIQ uses today) | Free | Everything | **No licence at all.** Unofficial scraping of Yahoo's site; their terms forbid it. Fine for local development, risky for a public product |

## Recommendation

1. **Now (free):** switch company fundamentals to SEC EDGAR. No signup needed.
2. **Prices, $0 path:** open a free Alpaca account, generate API keys, and send the email below. Use Alpaca once they say yes.
3. **Prices, no-waiting path:** Marketstack Basic at ~$10/month. 15-minute or end-of-day prices are plenty for an education simulator, and caching keeps you under the request cap.
4. Keep Yahoo only as the local-development fallback.

Real-time prices aren't needed for learning. Delayed or end-of-day data also avoids exchange real-time fees entirely.

## Email to send Alpaca (support@alpaca.markets)

> Subject: Written notice: displaying Basic-plan market data in an educational app
>
> Hi Alpaca team,
>
> I run TradeIQ (https://tradeiq-production-bda9.up.railway.app), a free financial-education website for beginners with a simulated (paper) trading game. No real orders are placed and no brokerage accounts are connected.
>
> Per your Terms, I'm giving written notice that I'd like to use the free Basic plan (IEX feed) through my Alpaca account to display delayed or end-of-day stock prices and simple charts to my site's users for educational purposes. I would label the data source, cache data server-side, not resell or export raw data, and stay within your rate limits.
>
> Could you confirm whether this use is permitted on the Basic plan, or tell me which plan or agreement I'd need?
>
> Thanks,
> [Your name]
> [Account email]
