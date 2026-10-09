// Unit 4: Futures. Chapter 1: Futures From Zero.
export default {
  id: 'futures-ch1',
  title: 'Futures From Zero',
  blurb: 'What a futures contract actually is, who trades them, how to read the specs, and when the market is open.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1: What a futures contract is
    // ------------------------------------------------------------------
    {
      id: 'futures-1-what-is-a-future',
      title: 'A Promise With a Price Tag',
      summary: 'A futures contract is a binding deal to buy or sell something later at a price set today. Ms. Ortiz and a wheat farmer show you why that is useful.',
      minutes: 13,
      icon: 'wheat',
      steps: [
        {
          type: 'read',
          title: "Ms. Ortiz's flour problem",
          html: `<p>Ms. Ortiz runs a busy bakery. Every month she goes through a mountain of flour, and flour is made from <strong>wheat</strong>. When wheat prices jump, her costs jump. Her customers, though, do not want her croissant price changing every Tuesday.</p>
<p>Last year a drought somewhere far away pushed wheat prices up, and her profit on bread nearly vanished for a few months. She did nothing wrong. The weather just sent her a bill.</p>
<p>So she asks a simple question: <span class="hl">"Can I lock in what I pay for wheat now, even though I will not need it until later?"</span></p>
<p>That question is about 175 years old, and the answer is the reason futures markets exist.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Futures sound like sci-fi. They are actually about bread. Stick with me." },
        },
        {
          type: 'read',
          title: 'Meet the farmer on the other side',
          html: `<p>Out in Kansas, a wheat farmer named Hal has the opposite worry. His crop will be harvested in a few months. If wheat prices <span class="down">fall</span> before then, his whole year of work gets paid less.</p>
<p>Ms. Ortiz fears prices going <strong>up</strong>. Hal fears prices going <strong>down</strong>. That is a perfect match.</p>
<p>So in March they make a deal: Hal will sell Ms. Ortiz <strong>5,000 bushels</strong> of wheat in September at <strong>$5.50 per bushel</strong>, no matter what the market price is in September.</p>
<ul>
<li>If wheat soars to $7, Ms. Ortiz still pays $5.50. She is protected.</li>
<li>If wheat crashes to $4, Hal still gets $5.50. He is protected.</li>
</ul>
<p>Both give up the chance of a lucky surprise in exchange for <span class="hl">certainty</span>. A private deal like this is called a <span class="term" data-def="A private, customized agreement to buy or sell something at a set price on a future date. Not traded on an exchange.">forward contract</span>.</p>`,
        },
        { type: 'diagram', name: 'futures-contract', caption: 'Today the buyer and seller agree on a price. Later, the goods and money change hands at that price, whatever the market says by then.' },
        {
          type: 'check',
          question: 'In the deal above, who is protected if wheat prices rise sharply before September?',
          options: ['Ms. Ortiz, the buyer', 'Hal, the farmer', 'Neither of them', 'Both of them equally'],
          answer: 0,
          explain: 'Ms. Ortiz locked in a buying price of $5.50. If the market price rises, she still pays $5.50, so rising prices cannot hurt her. Hal is the one who gives up that upside.',
        },
        {
          type: 'read',
          title: 'What could go wrong with a handshake?',
          html: `<p>Forward contracts are useful, but they have real problems:</p>
<ul>
<li><strong>Finding a partner is hard.</strong> Ms. Ortiz needs to find a farmer with the right amount, the right quality, and the right timing.</li>
<li><strong>The other side might bail.</strong> If wheat hits $8, Hal might be tempted to "forget" the deal and sell to someone else. This is <span class="term" data-def="The risk that the other party in a deal fails to hold up their end.">counterparty risk</span>.</li>
<li><strong>Getting out is awkward.</strong> If Ms. Ortiz closes a location and no longer needs the wheat, she has to negotiate her way out with Hal.</li>
</ul>
<p>Every forward is a custom, one-off promise between two people. That is flexible, but it is also fragile.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A promise is only as good as the person making it. When prices move a lot, some people get very forgetful." },
        },
        {
          type: 'read',
          title: 'Futures fix the handshake',
          html: `<p>A <span class="term" data-def="A standardized, exchange-traded agreement to buy or sell a set quantity of something at a set price on a set future date.">futures contract</span> is a forward contract that got organized. Three upgrades:</p>
<ol>
<li><strong>Standardized.</strong> The exchange sets the quantity, quality, and delivery months. A CBOT wheat contract is always 5,000 bushels of a specified grade. Every contract is identical, so anyone can trade with anyone.</li>
<li><strong>Exchange-traded.</strong> Buyers and sellers meet in one central market (today, mostly electronic). You do not need to find Hal. You just need a price.</li>
<li><strong>Cleared.</strong> A <span class="term" data-def="An organization that stands between every buyer and seller of a futures contract and guarantees each side gets paid.">clearinghouse</span> becomes the buyer to every seller and the seller to every buyer. If someone defaults, the clearinghouse still makes good on the deal.</li>
</ol>
<p>Because every contract is the same, getting out is easy: you just make the opposite trade. Bought one? Sell one to close it.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Standardized plus cleared means you never need to trust the stranger on the other side. You trust the clearinghouse instead." },
        },
        {
          type: 'cards',
          title: 'Words to know',
          cards: [
            { front: 'Futures contract', back: 'A standardized, exchange-traded deal to buy or sell a set amount of something at a set price on a future date.' },
            { front: 'Forward contract', back: 'A private, custom version of the same idea, negotiated between two parties.' },
            { front: 'Long', back: 'You bought the contract. You gain if the price rises.' },
            { front: 'Short', back: 'You sold the contract. You gain if the price falls.' },
            { front: 'Underlying', back: 'The thing the contract is based on: wheat, oil, gold, a stock index, and so on.' },
            { front: 'Clearinghouse', back: 'The middleman that guarantees both sides of every trade.' },
          ],
        },
        {
          type: 'match',
          prompt: 'Match each feature to the contract type it describes best.',
          pairs: [
            { left: 'Terms negotiated privately between two parties', right: 'Forward' },
            { left: 'Identical contract sizes set by an exchange', right: 'Futures' },
            { left: 'A clearinghouse guarantees both sides', right: 'Futures' },
            { left: 'Hardest to exit early without the other party agreeing', right: 'Forward' },
          ],
        },
        {
          type: 'read',
          title: 'Long, short, and the scoreboard',
          html: `<p>In futures you can start a trade from either side, and both are equally normal:</p>
<ul>
<li><strong>Long</strong> (buy first) if you think the price will rise, or if, like Ms. Ortiz, you need to protect against it rising.</li>
<li><strong>Short</strong> (sell first) if you think the price will fall, or if, like Hal, you need protection against it falling.</li>
</ul>
<p>The math is simple: <span class="hl">price change x contract size</span>. Say Ms. Ortiz buys one wheat futures contract at $5.50 and wheat rises to $6.00. That is $0.50 per bushel x 5,000 bushels = <span class="up">+$2,500</span> for her. Whoever sold that contract is down exactly <span class="down">-$2,500</span>.</p>
<p>That is why futures are called a <span class="term" data-def="A setup where one side's gain is exactly the other side's loss, before fees.">zero-sum game</span>: before fees, every dollar one side makes, the other side loses.</p>`,
        },
        {
          type: 'numeric',
          question: 'Hal sold one wheat futures contract (5,000 bushels) at $5.50. Wheat falls to $5.30. How much did his short position gain?',
          answer: 1000,
          tolerance: 0.01,
          unit: '$',
          explain: 'The price fell $0.20 per bushel. $0.20 x 5,000 bushels = $1,000. A short gains when the price falls.',
        },
        {
          type: 'truefalse',
          statement: 'Most futures contracts end with someone actually delivering the goods, like a truck of wheat.',
          answer: false,
          explain: 'The vast majority of futures positions are closed out by an opposite trade before expiration. Many contracts, like stock index futures, cannot be delivered at all and settle in cash.',
        },
        {
          type: 'read',
          title: 'How the bakery actually uses it',
          html: `<p>Here is the twist. Ms. Ortiz does not need wheat shipped from Chicago. She buys flour from her local supplier like always.</p>
<p>What she does is buy wheat <em>futures</em> as a financial hedge. If wheat prices rise, her flour bill goes up, but her futures position gains about the same amount. The gain offsets the higher cost. If wheat falls, her futures lose money, but her flour gets cheaper. Either way her total cost ends up close to what she planned.</p>
<p>Before September she simply sells the contracts to close them. No trucks. No silos. Just a steadier cost for her business.</p>
<p>The same idea works for an airline worried about fuel, a gold miner worried about gold prices, or a fund manager worried about a stock market drop.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: "Hedging is like budgeting for chaos. You give up the jackpot so a bad surprise cannot wreck you." },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: 'A futures contract is an obligation',
          html: `<p>An option gives you the <em>right</em> to buy or sell. A futures contract is an <strong>obligation</strong>. If you hold a position, every move in the price lands in your account, good or bad, until you close it. There is no "I'll just let it expire worthless." Coming up: why that obligation, plus leverage, makes futures one of the riskiest tools a beginner can touch.</p>`,
        },
        {
          type: 'read',
          title: 'Futures on almost everything',
          html: `<p>Wheat was the start, but today there are futures on:</p>
<ul>
<li><strong>Stock indexes:</strong> the S&amp;P 500, Nasdaq-100, Dow, Russell 2000</li>
<li><strong>Energy:</strong> crude oil, natural gas, gasoline</li>
<li><strong>Metals:</strong> gold, silver, copper</li>
<li><strong>Interest rates:</strong> US Treasury notes and bonds</li>
<li><strong>Currencies:</strong> the euro, yen, British pound</li>
<li><strong>Agriculture:</strong> corn, soybeans, wheat, cattle</li>
</ul>
<p>Same idea every time: a standardized promise, a set size, a future date, and a clearinghouse in the middle. Learn the structure once and you can read any of them.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'Which best describes a futures contract?', options: ['A right, but not an obligation, to buy a stock', 'A standardized, exchange-traded obligation to buy or sell at a set price on a future date', 'A private loan between two businesses', 'A share of ownership in a commodity company'], answer: 1, explain: 'Futures are standardized and exchange-traded, and they are obligations, not rights. The "right but not obligation" description fits options.' },
            { q: 'What is the main job of the clearinghouse?', options: ['Setting the price of wheat', 'Lending traders money', 'Guaranteeing both sides of every trade', 'Delivering the physical goods'], answer: 2, explain: 'The clearinghouse stands between buyer and seller, so neither has to trust the other. Prices are set by buyers and sellers in the market.' },
            { q: 'Ms. Ortiz worries wheat prices will rise. Which position protects her?', options: ['Short wheat futures', 'No position', 'Selling her bakery equipment', 'Long wheat futures'], answer: 3, explain: 'A long position gains when prices rise, offsetting her higher flour costs.' },
            { q: 'Dev buys one wheat contract (5,000 bushels) at $5.80 and sells it at $5.70. What is his result before fees?', options: ['-$500', '+$500', '-$50', '-$5,000'], answer: 0, explain: '$0.10 drop x 5,000 bushels = $500 loss. He was long, so a falling price hurts.' },
            { q: 'Which is a real advantage of futures over a private forward contract?', options: ['Futures guarantee a profit', 'Futures can be customized to any quantity you want', 'Futures are easy to exit by making the opposite trade', 'Futures have no risk because they are on an exchange'], answer: 2, explain: 'Standardization means anyone can take the other side, so closing is simple. Futures still carry plenty of risk, and their sizes are fixed, not custom.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 2: Hedgers vs speculators
    // ------------------------------------------------------------------
    {
      id: 'futures-1-hedgers-speculators',
      title: 'Hedgers, Speculators & a Muddy Chicago',
      summary: 'Who actually trades futures and why. Hedgers want less risk, speculators want profit, and the market needs both. Plus a quick history from Chicago grain to CME Group.',
      minutes: 13,
      icon: 'scale',
      steps: [
        {
          type: 'read',
          title: 'Two very different reasons to trade',
          html: `<p>Every futures market has two main kinds of players, and they show up for opposite reasons.</p>
<p><strong>Hedgers</strong> already have a real-world exposure to a price. Ms. Ortiz buys flour. Hal grows wheat. An airline burns jet fuel. They use futures to <span class="hl">reduce</span> a risk they already carry.</p>
<p><strong>Speculators</strong> have no wheat, no farm, no airline. They trade futures because they think they can predict where the price is heading and profit from it. They are <span class="hl">taking on</span> risk on purpose.</p>
<p>One wants to get rid of risk. The other wants to hold it, for a price. That is not a conflict. It is a trade that works for both.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Hedgers hand off risk. Speculators catch it. The market is basically a giant game of hot potato with prices." },
        },
        { type: 'diagram', name: 'hedger-speculator', caption: 'Hedgers on one side pass price risk across the market. Speculators on the other side accept that risk hoping to be paid for it.' },
        {
          type: 'read',
          title: 'Hedgers: insurance shoppers',
          html: `<p>Hedgers come in every shape:</p>
<ul>
<li>A <strong>corn farmer</strong> sells corn futures before harvest so a price crash does not wipe out the year.</li>
<li>An <strong>airline</strong> buys oil-related futures so a fuel spike does not blow up its budget.</li>
<li>A <strong>gold miner</strong> sells gold futures to lock in a price for metal it has not dug up yet.</li>
<li>A <strong>pension fund</strong> sells stock index futures to protect a giant stock portfolio during a scary stretch, without selling thousands of individual shares.</li>
<li>A <strong>company</strong> that gets paid in euros sells euro futures so currency swings do not shrink its revenue.</li>
</ul>
<p>The hedger's futures trade often loses money, and that is fine. If the airline's oil futures lose because fuel got cheaper, the airline is paying less for fuel anyway. Judging a hedge by its own profit is like being mad your house did not burn down so the fire insurance "lost."</p>`,
        },
        {
          type: 'check',
          question: 'A chocolate company buys cocoa futures because it worries cocoa prices will rise next year. What is it?',
          options: ['A speculator, because it bought futures', 'A hedger, because it already needs cocoa and wants to lock in the cost', 'A clearinghouse', 'An arbitrageur, because it buys and sells at the same time'],
          answer: 1,
          explain: 'The company has a real business need for cocoa. Buying futures reduces its exposure to rising prices. That is hedging, even though it is a "buy."',
        },
        {
          type: 'read',
          title: 'Speculators: the people who show up',
          html: `<p>Speculators get a bad reputation, but markets would be pretty sad without them.</p>
<p>Imagine Ms. Ortiz wants to buy wheat futures at 10:14 on a Tuesday morning. She needs someone to sell right then. What are the odds a farmer wants to sell exactly that amount at exactly that moment? Low.</p>
<p>Speculators fill the gap. Because they are trading all day for profit, there is almost always someone willing to take the other side. That is called <span class="term" data-def="How easily you can buy or sell something quickly without moving the price much.">liquidity</span>.</p>
<p>More liquidity means a tighter <span class="term" data-def="The gap between the highest price buyers are bidding and the lowest price sellers are asking.">bid-ask spread</span>. In a very busy contract like the E-mini S&amp;P 500, during active hours the bid and ask are usually just one tick apart. That saves hedgers real money on every trade.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Speculators get paid, on average, for carrying risk nobody else wants. Some win big. Plenty lose. The hedger gets a fair price either way." },
        },
        {
          type: 'match',
          prompt: 'Hedger or speculator? Match each trader to their role.',
          pairs: [
            { left: 'A soybean farmer selling futures before harvest', right: 'Hedger' },
            { left: 'Dev buying Nasdaq futures because a chart looks bullish', right: 'Speculator' },
            { left: 'A pension fund selling index futures to protect its stocks', right: 'Hedger' },
            { left: 'A trading firm betting gold rises after a Fed meeting', right: 'Speculator' },
          ],
        },
        {
          type: 'read',
          title: 'Price discovery: the market as a forecast',
          html: `<p>Futures do one more job for everyone, even people who never trade them: <span class="term" data-def="The process by which buying and selling in a market reveals what something is worth right now.">price discovery</span>.</p>
<p>Thousands of traders, each with their own information, are constantly buying and selling. The resulting price is the market's best collective guess at what something is worth for a given delivery date.</p>
<ul>
<li>A farmer deciding how much corn vs soybeans to plant can look at futures prices for next fall.</li>
<li>Stock index futures trade almost around the clock, so when big news hits at night, they show how the market is reacting hours before the stock market opens at 9:30am ET.</li>
<li>Oil futures prices ripple into what you eventually pay at the gas pump.</li>
</ul>
<p>The price is not a promise of the future. It is just today's best estimate, and it changes the moment new information shows up.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Futures price = what everyone combined thinks right now. Not a prophecy. Update frequency: constantly." },
        },
        {
          type: 'truefalse',
          statement: 'Because speculators are only in it for profit, markets would work better without them.',
          answer: false,
          explain: 'Speculators provide much of the liquidity that lets hedgers trade quickly at fair prices. Regulators do watch for excessive speculation, which is one reason some contracts have position limits, but removing speculators would make hedging harder and more expensive.',
        },
        {
          type: 'read',
          title: 'A quick history: grain, mud, and Chicago',
          html: `<p>In the mid-1800s, Chicago was where Midwest farmers brought grain to sell. The problem: everyone harvested at the same time. Each fall, wagons flooded the city, prices collapsed, and some grain literally rotted in the streets. Months later, grain got scarce and prices shot up.</p>
<p>In <strong>1848</strong>, merchants founded the <strong>Chicago Board of Trade (CBOT)</strong> to bring order to the chaos. Traders began making "to-arrive" deals for grain to be delivered later, and by <strong>1865</strong> the CBOT had formalized standardized rules for these contracts. That is the ancestor of today's futures.</p>
<p>Across town, the Chicago Butter and Egg Board, founded in 1898, renamed itself the <strong>Chicago Mercantile Exchange (CME)</strong> in 1919. In 1972 the CME launched currency futures, and in 1982 it launched futures on the S&amp;P 500, which pulled finance, not just farming, into the futures world.</p>
<p>In 2007, CME and CBOT merged to form <strong>CME Group</strong>, which added NYMEX (energy) and COMEX (metals) in 2008.</p>`,
        },
        {
          type: 'order',
          prompt: 'Put these futures milestones in order, oldest first.',
          items: ['Chicago Board of Trade founded', 'Chicago Butter and Egg Board renamed the Chicago Mercantile Exchange', 'CME launches currency futures', 'S&P 500 futures launch', 'CME and CBOT merge into CME Group'],
          explain: 'CBOT 1848, CME name 1919, currency futures 1972, S&P 500 futures 1982, CME Group 2007.',
        },
        {
          type: 'read',
          title: 'From shouting pits to servers',
          html: `<p>For over a century, futures were traded in <strong>open outcry pits</strong>: crowds of traders in colored jackets yelling and flashing hand signals. If you have seen an old movie about Wall Street chaos, that energy came from the pits.</p>
<p>Electronic trading slowly took over. CME's electronic platform, <strong>Globex</strong>, launched in 1992, and in 2015 CME closed most of its futures trading pits. Today nearly all futures volume is matched by computers in milliseconds.</p>
<p>Other big exchanges exist too. <strong>ICE</strong> (Intercontinental Exchange) runs major markets like Brent crude oil, plus coffee, sugar, and cocoa. But for US stock index futures, Treasury futures, WTI crude, and gold, the main venue is CME Group.</p>`,
        },
        {
          type: 'cards',
          title: 'Names you will keep seeing',
          cards: [
            { front: 'CBOT', back: 'Chicago Board of Trade, founded 1848. Home of grain and Treasury futures. Now part of CME Group.' },
            { front: 'CME', back: 'Chicago Mercantile Exchange. Home of stock index and currency futures like the E-mini S&P 500.' },
            { front: 'NYMEX and COMEX', back: 'New York exchanges for energy (like WTI crude) and metals (like gold). Both owned by CME Group since 2008.' },
            { front: 'Globex', back: "CME Group's electronic trading platform, where nearly all of its futures now trade." },
            { front: 'ICE', back: 'Intercontinental Exchange, another major exchange, home of Brent crude and many soft commodities.' },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Be honest about which side you are on',
          html: `<p>If you ever trade futures to make money, you are a <strong>speculator</strong>. Your opponents include professional firms with faster computers, better data, and teams of researchers. That does not mean you cannot learn, but it does mean "I watched three videos" is not an edge. The rest of this unit is about understanding the game well enough to respect it.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What separates a hedger from a speculator?', options: ['Hedgers only sell; speculators only buy', 'Hedgers trade larger sizes', 'Hedgers already have a real-world price exposure they want to reduce', 'Speculators must be licensed professionals'], answer: 2, explain: 'It is about motive, not direction. A hedger is offsetting a risk it already has. Both hedgers and speculators can be long or short.' },
            { q: 'How do speculators help hedgers?', options: ['They guarantee hedgers a profit', 'They provide liquidity, so hedgers can trade quickly at fair prices', 'They set the official contract specifications', 'They store the physical commodity'], answer: 1, explain: 'By trading constantly, speculators make it easy for hedgers to find someone on the other side, which keeps spreads tight.' },
            { q: 'An airline hedged with oil futures, and fuel prices then dropped. Its futures lost money. What happened overall?', options: ['The hedge failed and the airline should stop hedging', 'The airline lost twice', 'The airline made money on both', 'The futures loss was roughly offset by cheaper fuel, which was the point'], answer: 3, explain: 'A hedge trades away upside for certainty. Cheaper fuel offsets the futures loss, leaving costs close to plan.' },
            { q: 'In what year was the Chicago Board of Trade founded?', options: ['1848', '1898', '1919', '1972'], answer: 0, explain: 'The CBOT was founded in 1848. 1898 is the Butter and Egg Board, 1919 is the CME name, and 1972 is currency futures.' },
            { q: 'What does "price discovery" mean?', options: ['The exchange announcing the official price each morning', 'Buying and selling revealing what the market collectively thinks something is worth', 'Finding a mispriced stock', 'A government setting commodity prices'], answer: 1, explain: 'Prices emerge from many traders acting on their own information. No one announces them.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 3: Contract specs
    // ------------------------------------------------------------------
    {
      id: 'futures-1-contract-specs',
      title: 'Reading the Spec Sheet: Ticks, Points & Dollars',
      summary: 'ES, NQ, CL, GC: every contract has a size, a tick, and a dollar value per move. Learn to turn "it moved 10 points" into real money.',
      minutes: 15,
      icon: 'calculator',
      steps: [
        {
          type: 'read',
          title: 'Every contract comes with a spec sheet',
          html: `<p>Because futures are standardized, the exchange publishes a <span class="term" data-def="The official rules of a futures contract: what it tracks, how big it is, how it is priced, and when it expires.">contract specification</span> for each one. Before anyone trades a contract, they should know these numbers cold:</p>
<ul>
<li><strong>Underlying:</strong> what it tracks (S&amp;P 500, crude oil, gold...)</li>
<li><strong>Contract size or multiplier:</strong> how much of the underlying one contract represents</li>
<li><strong>Tick size:</strong> the smallest price move allowed</li>
<li><strong>Tick value:</strong> how many dollars one tick is worth for one contract</li>
<li><strong>Contract months and settlement:</strong> when it expires and how (next lesson)</li>
</ul>
<p>Skip these and you are trading a number on a screen without knowing what each wiggle costs you. That is how people get surprised by a four-figure loss on a "small" move.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "The spec sheet is the boring page that keeps your account alive. Boring pages are underrated." },
        },
        {
          type: 'read',
          title: 'Ticker roots',
          html: `<p>Each contract has a short code called a <span class="term" data-def="The base symbol for a futures product, before the month and year are added.">root symbol</span>. A few big ones:</p>
<ul>
<li><strong>ES</strong> E-mini S&amp;P 500 and <strong>MES</strong> Micro E-mini S&amp;P 500</li>
<li><strong>NQ</strong> E-mini Nasdaq-100 and <strong>MNQ</strong> Micro E-mini Nasdaq-100</li>
<li><strong>YM</strong> E-mini Dow ($5 multiplier)</li>
<li><strong>CL</strong> WTI crude oil</li>
<li><strong>GC</strong> gold</li>
<li><strong>ZN</strong> 10-year US Treasury note</li>
<li><strong>6E</strong> euro FX</li>
<li><strong>ZC</strong> corn</li>
</ul>
<p>The full ticker adds a month code and a year digit, like <strong>ESZ6</strong> for the December 2026 E-mini S&amp;P. Month codes get their own lesson next.</p>`,
        },
        {
          type: 'cards',
          title: 'The spec-sheet vocabulary',
          cards: [
            { front: 'Multiplier', back: 'For index futures, the dollars per one full point of the index. ES is $50 per point.' },
            { front: 'Tick size', back: 'The smallest allowed price change. ES moves in steps of 0.25 index points.' },
            { front: 'Tick value', back: 'Tick size x multiplier. For ES, 0.25 x $50 = $12.50 per tick, per contract.' },
            { front: 'Point value', back: 'Dollars per one full point of price. For ES, $50. One point of ES is four ticks.' },
            { front: 'Notional value', back: 'The total value the contract controls: price x multiplier. Much bigger than the money you put up.' },
          ],
        },
        {
          type: 'read',
          title: 'The one formula',
          html: `<p>Almost every futures P&amp;L question comes down to this:</p>
<p><span class="hl">Profit or loss = number of ticks moved x tick value x number of contracts</span></p>
<p>or, if you think in points:</p>
<p><span class="hl">Profit or loss = points moved x point value x number of contracts</span></p>
<p>Example: Leo buys 1 ES at 6,000.00 and sells at 6,004.50. That is 4.5 points, or 18 ticks. 18 x $12.50 = <span class="up">+$225</span>. Same answer with points: 4.5 x $50 = $225.</p>
<p>If he had bought 1 <strong>MES</strong> instead, same move, the point value is only $5: 4.5 x $5 = <span class="up">+$22.50</span>. Same chart, one tenth of the money.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Ticks times tick value. Tattoo it on your brain. Not your arm. Your brain." },
        },
        {
          type: 'read',
          title: 'Stock index futures cheat sheet',
          html: `<p>These are the CME equity index contracts beginners hear about most:</p>
<table>
<thead><tr><th>Contract</th><th>Multiplier</th><th>Tick</th><th>Tick value</th><th>Per point</th></tr></thead>
<tbody>
<tr><td>ES (E-mini S&amp;P 500)</td><td>$50 x index</td><td>0.25</td><td>$12.50</td><td>$50</td></tr>
<tr><td>MES (Micro S&amp;P 500)</td><td>$5 x index</td><td>0.25</td><td>$1.25</td><td>$5</td></tr>
<tr><td>NQ (E-mini Nasdaq-100)</td><td>$20 x index</td><td>0.25</td><td>$5.00</td><td>$20</td></tr>
<tr><td>MNQ (Micro Nasdaq-100)</td><td>$2 x index</td><td>0.25</td><td>$0.50</td><td>$2</td></tr>
<tr><td>YM (E-mini Dow)</td><td>$5 x index</td><td>1.00</td><td>$5.00</td><td>$5</td></tr>
</tbody>
</table>
<p>Notice the pattern: each <strong>micro</strong> is exactly one tenth of its E-mini. Also notice YM ticks in whole points, not quarters.</p>`,
        },
        {
          type: 'numeric',
          question: 'Maya paper-trades 1 ES. She buys at 6,000.00 and sells at 6,010.00. What is her profit in dollars?',
          answer: 500,
          tolerance: 0.01,
          unit: '$',
          explain: '10 points x $50 per point = $500. In ticks: 40 ticks x $12.50 = $500.',
        },
        {
          type: 'numeric',
          question: 'Dev is long 1 MNQ. The Nasdaq-100 futures price drops 40 points. How much does he lose?',
          answer: 80,
          tolerance: 0.01,
          unit: '$',
          explain: 'MNQ is $2 per point. 40 points x $2 = $80. On a full-size NQ ($20 per point), the same drop would cost $800.',
        },
        {
          type: 'read',
          title: 'Beyond stock indexes',
          html: `<p>Commodity, rate, and currency contracts use physical units instead of a multiplier:</p>
<table>
<thead><tr><th>Contract</th><th>Size</th><th>Tick</th><th>Tick value</th></tr></thead>
<tbody>
<tr><td>CL (WTI crude)</td><td>1,000 barrels</td><td>$0.01/barrel</td><td>$10</td></tr>
<tr><td>GC (gold)</td><td>100 troy oz</td><td>$0.10/oz</td><td>$10</td></tr>
<tr><td>ZC (corn)</td><td>5,000 bushels</td><td>1/4 cent/bushel</td><td>$12.50</td></tr>
<tr><td>ZN (10-yr note)</td><td>$100,000 face value</td><td>half of 1/32 of a point</td><td>$15.625</td></tr>
<tr><td>6E (euro FX)</td><td>125,000 euros</td><td>$0.00005/euro</td><td>$6.25</td></tr>
</tbody>
</table>
<p>Same formula as always. For CL, a $1.00 move in oil is 100 ticks x $10 = <strong>$1,000</strong> per contract. For GC, a $1 move in gold is 10 ticks x $10 = <strong>$100</strong> per contract, because you control 100 ounces.</p>`,
        },
        {
          type: 'read',
          title: 'Traders think in ticks, including costs',
          html: `<p>Once you know tick values, you start seeing <strong>costs</strong> in ticks too.</p>
<ul>
<li><strong>The spread.</strong> If ES is bid at 6,000.00 and offered at 6,000.25, buying at the ask and immediately selling at the bid costs you one tick: $12.50. On MES that same tick is $1.25.</li>
<li><strong>Commissions and fees.</strong> Brokers and exchanges charge per contract, every time you open and close. Those fees vary by broker, so check yours, but on micros they can eat a noticeable chunk of a small win.</li>
<li><strong>Slippage.</strong> In a fast market your order may fill a tick or two worse than the price you saw. A stop order during a news spike can slip much more.</li>
</ul>
<p>Here is why that matters: a trader who scalps for 2-tick wins and pays 1 tick in spread plus fees on every round trip is giving away a huge share of each win before anything goes wrong. Many day traders never do this math. Now you can.</p>`,
        },
        {
          type: 'callout',
          variant: 'example',
          title: 'Same idea, different units',
          html: `<p>Notional value works the same way for every contract. One ES at 6,000 controls 6,000 x $50 = <strong>$300,000</strong> of S&amp;P 500 exposure. One GC with gold at, say, $4,000 an ounce controls 100 x $4,000 = <strong>$400,000</strong> of gold. One ZN controls $100,000 of face value in Treasury notes. These are big numbers, and the money you put down to hold them is only a small slice. That gap is leverage, and it gets a whole chapter later in this unit.</p>`,
        },
        {
          type: 'numeric',
          question: 'Leo buys 1 CL crude oil contract at $72.40 and sells at $73.15. What is his profit?',
          answer: 750,
          tolerance: 0.01,
          unit: '$',
          explain: 'The move is $0.75 per barrel, which is 75 ticks. 75 x $10 = $750. Or: $0.75 x 1,000 barrels = $750.',
        },
        {
          type: 'numeric',
          question: 'Gold futures (GC, 100 troy oz) fall $25 per ounce. How much does one short GC contract gain?',
          answer: 2500,
          tolerance: 0.01,
          unit: '$',
          explain: '$25 x 100 ounces = $2,500. A short gains when the price falls.',
        },
        {
          type: 'match',
          prompt: 'Match each root symbol to what it tracks.',
          pairs: [
            { left: 'ES', right: 'S&P 500 index' },
            { left: 'CL', right: 'WTI crude oil' },
            { left: 'GC', right: 'Gold' },
            { left: 'ZN', right: '10-year Treasury note' },
            { left: '6E', right: 'Euro vs US dollar' },
          ],
        },
        { type: 'widget', name: 'futures-leverage', props: { contract: 'ES' }, caption: 'Switch between ES, MES, NQ, MNQ, CL and GC. Drag the price move and watch the dollars per contract. Notice how fast full-size contracts add up.' },
        {
          type: 'read',
          title: 'The 10x mistake',
          html: `<p>Here is a classic beginner disaster. Dev means to buy 1 <strong>MNQ</strong> ($2 per point). In a hurry, he clicks <strong>NQ</strong> ($20 per point). The chart looks exactly the same. The price is exactly the same.</p>
<p>Nasdaq futures then drop 50 points in a few minutes, which is not unusual on a volatile day. On MNQ that would be a $100 loss. On NQ it is a <span class="down">-$1,000</span> loss.</p>
<p>The fix is boring: before every order, say the dollar value of one point out loud. "This is 20 dollars a point." If that sentence makes your stomach drop, the size is wrong.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Same chart, same price, ten times the damage. Check the symbol twice. The market does not accept 'I clicked the wrong one.'" },
        },
        {
          type: 'check',
          question: 'Which move costs the most money for one contract?',
          options: ['ES moves 10 points', 'NQ moves 20 points', 'CL moves $0.30', 'MES moves 50 points'],
          answer: 0,
          explain: 'ES: 10 x $50 = $500. NQ: 20 x $20 = $400. CL: 30 ticks x $10 = $300. MES: 50 x $5 = $250. Never compare moves by points alone; convert to dollars.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Always check the official specs',
          html: `<p>The numbers in this lesson are the CME specifications for these contracts, but exchanges can and occasionally do change contract details. Before trading anything, look up the product on CME Group's website and confirm the size, tick, trading hours, and expiration rules yourself. Your broker's platform also shows these, often under "contract details."</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What is the tick value of one ES contract?', options: ['$5.00', '$50.00', '$1.25', '$12.50'], answer: 3, explain: '0.25 point tick x $50 multiplier = $12.50. $1.25 is MES, $5 is NQ or YM, $50 is the ES value per full point.' },
            { q: 'Ms. Ortiz hedges with 1 corn contract (ZC, 5,000 bushels). Corn rises 10 cents per bushel. How much does a long contract gain?', options: ['$50', '$500', '$1,250', '$5,000'], answer: 1, explain: '$0.10 x 5,000 bushels = $500. In ticks: 10 cents is 40 quarter-cent ticks x $12.50 = $500.' },
            { q: 'How does MES compare to ES?', options: ['It is one tenth the size', 'It is half the size', 'It tracks a different index', 'It has a smaller tick size'], answer: 0, explain: 'MES is $5 x the S&P 500 index vs $50 for ES, so one tenth. Same index, same 0.25 tick size.' },
            { q: 'Dev is short 2 YM contracts. The Dow futures rise 120 points. What is his result?', options: ['-$600', '-$2,400', '-$1,200', '+$1,200'], answer: 2, explain: 'YM is $5 per point. 120 x $5 x 2 contracts = $1,200. He is short and price rose, so it is a loss.' },
            { q: 'CL is quoted at $70.00. What is the notional value of one contract?', options: ['$700', '$7,000', '$700,000', '$70,000'], answer: 3, explain: '1,000 barrels x $70 = $70,000. One contract controls that much oil even though you deposit far less as margin.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 4: Expiration, month codes, rollover
    // ------------------------------------------------------------------
    {
      id: 'futures-1-expiration-rollover',
      title: 'Expiration Dates, Month Codes & the Roll',
      summary: 'Futures expire like milk. Learn the month codes, when stock index futures expire, how traders roll to the next contract, and why nobody wants 1,000 barrels of oil on their porch.',
      minutes: 14,
      icon: 'clock',
      steps: [
        {
          type: 'read',
          title: 'Futures have an expiration date',
          html: `<p>A share of stock can sit in your account forever. A futures contract cannot. Each one is tied to a specific <strong>contract month</strong>, and when that month's deadline arrives, the contract <span class="term" data-def="The date a futures contract stops trading and is settled, either in cash or by delivery.">expires</span>.</p>
<p>That makes sense once you remember where futures came from. Ms. Ortiz did not want wheat "someday." She wanted it in September. So there is a September contract, a December contract, and so on, each a separate thing with its own price.</p>
<p>This creates three practical questions every futures trader must answer:</p>
<ol>
<li>Which month am I actually trading?</li>
<li>When does it expire?</li>
<li>What happens if I am still holding it then?</li>
</ol>`,
          sprite: { who: 'chip', mood: 'happy', say: "Stocks are like a house you own. Futures are like a carton of milk. Read the date on the side." },
        },
        {
          type: 'read',
          title: 'The twelve month codes',
          html: `<p>Futures tickers use one letter for each month:</p>
<table>
<thead><tr><th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th></tr></thead>
<tbody><tr><td>F</td><td>G</td><td>H</td><td>J</td><td>K</td><td>M</td></tr></tbody>
</table>
<table>
<thead><tr><th>Jul</th><th>Aug</th><th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th></tr></thead>
<tbody><tr><td>N</td><td>Q</td><td>U</td><td>V</td><td>X</td><td>Z</td></tr></tbody>
</table>
<p>A full ticker is <span class="hl">root + month code + year digit</span>. So <strong>CLF7</strong> is WTI crude for January 2027, and <strong>GCZ6</strong> is gold for December 2026. Some platforms show two-digit years, like ESZ26. Same thing.</p>
<p>The letters look random, and honestly they mostly are. Just memorize the four big ones for stock index futures: <strong>H, M, U, Z</strong>.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "No, M is not May. M is June. K is May. I did not make the rules. I just enforce them with flashcards." },
        },
        {
          type: 'match',
          prompt: 'Match each month code to its month.',
          pairs: [
            { left: 'H', right: 'March' },
            { left: 'M', right: 'June' },
            { left: 'U', right: 'September' },
            { left: 'Z', right: 'December' },
            { left: 'F', right: 'January' },
          ],
        },
        {
          type: 'check',
          question: 'What does the ticker NQH7 refer to?',
          options: ['E-mini Nasdaq-100, June 2027', 'E-mini Nasdaq-100, March 2027', 'Micro Nasdaq-100, March 2027', 'E-mini Nasdaq-100, May 2027'],
          answer: 1,
          explain: 'NQ is the E-mini Nasdaq-100 (the micro is MNQ). H is March and 7 is 2027.',
        },
        {
          type: 'read',
          title: 'When stock index futures expire',
          html: `<p>ES, NQ, YM and their micros run on a <strong>quarterly cycle</strong>: March (H), June (M), September (U), and December (Z).</p>
<p>They expire on the <span class="hl">third Friday of the contract month</span>. Trading in the expiring contract stops that Friday morning at the 9:30am ET stock market open, and the contract settles to a special price based on the opening prices of the stocks in the index.</p>
<p>For example, the September 2026 contracts expired on Friday, September 18, 2026. As of October 2026, the main contract is <strong>December 2026 (ESZ6)</strong>, which expires on <strong>Friday, December 18, 2026</strong>. After that, attention moves to <strong>March 2027 (ESH7)</strong>, expiring Friday, March 19, 2027.</p>
<p>The contract that most people are trading right now is called the <span class="term" data-def="The contract month with the most trading activity, usually the one closest to expiration.">front month</span>.</p>`,
        },
        {
          type: 'callout',
          variant: 'fact',
          title: 'Why those Fridays get wild',
          html: `<p>The third Friday of March, June, September and December is when stock index futures and many stock and index options expire on the same day. Traders nickname it <strong>triple witching</strong> (you may also hear "quad witching"). Trading volume in the stock market often spikes that day, especially near the close, as big positions get closed, rolled, or settled. If you trade around then, expect unusual activity.</p>`,
        },
        { type: 'diagram', name: 'rollover', caption: 'As expiration nears, trading volume drains out of the old contract and pours into the next one. Traders roll by closing the old month and opening the new month.' },
        {
          type: 'read',
          title: 'Rolling over',
          html: `<p>Say Leo wants to stay long the S&amp;P 500 through the winter using futures. His December contract will expire, so about a week before expiration he <span class="term" data-def="Closing a futures position in the expiring month and opening the same position in a later month.">rolls</span>:</p>
<ol>
<li>Sell his December (Z) contract to close it.</li>
<li>Buy a March (H) contract to reopen the same exposure.</li>
</ol>
<p>Most big traders roll during the same window, usually the week or so before expiration, so trading volume shifts quickly from the old month to the new one. CME publishes a suggested roll date for its index contracts, and your platform will often show volume flipping to the next month around then.</p>
<p>Many brokers let you do both legs at once as a single <strong>calendar spread</strong> order, which avoids getting one leg filled and not the other.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Roll procedure: close old month, open new month, move your stops to the new contract. Skip step three and you have no protection." },
        },
        {
          type: 'truefalse',
          statement: 'When Leo rolls from December to March, both contracts will always be trading at exactly the same price.',
          answer: false,
          explain: 'Different months usually trade at different prices because of interest rates, dividends, storage costs and supply and demand. That gap matters, and Chapter 3 explains it.',
        },
        {
          type: 'read',
          title: 'Cash-settled vs physically delivered',
          html: `<p>What actually happens at expiration depends on the contract:</p>
<p><strong>Cash-settled.</strong> You cannot deliver "the S&amp;P 500" in a truck. So equity index futures like ES and NQ are <span class="term" data-def="Settled by paying the difference between the contract price and the final settlement price in cash. No goods change hands.">cash-settled</span>. At expiration, any open position is marked to a final price and the difference is paid in cash. Done.</p>
<p><strong>Physically delivered.</strong> Crude oil (CL), grains like corn (ZC), and metals like gold (GC) are <span class="term" data-def="At expiration, the seller actually delivers the commodity and the buyer must take and pay for it.">physically delivered</span>. If you are still long at the end, you are on the hook to take delivery and pay the full value. A CL contract is 1,000 barrels delivered at Cushing, Oklahoma. Treasury futures like ZN deliver actual Treasury notes.</p>
<p>Delivery works through the exchange's system with warehouses, pipelines, and shipping certificates. It is built for commercial firms, not for someone trading on a phone.</p>`,
        },
        {
          type: 'read',
          title: 'First notice day and last trading day',
          html: `<p>Two dates matter for physical contracts:</p>
<ul>
<li><strong>First notice day (FND):</strong> for many delivered contracts, like grains, metals and Treasuries, the first day sellers can announce they intend to deliver. Long holders after this point can be assigned delivery.</li>
<li><strong>Last trading day (LTD):</strong> the final day the contract trades. For CL, trading ends a few business days before the 25th of the month <em>before</em> the delivery month. So the December crude contract stops trading in late November.</li>
</ul>
<p>Retail brokers generally do not let individual traders take or make delivery. Most require you to close or roll physical contracts several days before FND or the last trading day, and if you do not, they may close the position for you at whatever the market price is, often with an extra fee.</p>
<p>The simple rule for regular people: <span class="hl">know the dates, and be out or rolled well before them.</span></p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "You do not want 1,000 barrels of crude. Your apartment does not want 1,000 barrels of crude. Know the dates." },
        },
        {
          type: 'cards',
          title: 'Expiration vocabulary',
          cards: [
            { front: 'Contract month', back: 'The month a specific futures contract is tied to, shown by the month code in the ticker.' },
            { front: 'Front month', back: 'The nearest, most actively traded contract month.' },
            { front: 'Roll', back: 'Closing the expiring contract and opening the same position in a later month.' },
            { front: 'First notice day', back: 'For many physically delivered contracts, the first day delivery can be announced to long holders.' },
            { front: 'Last trading day', back: 'The final day a contract month can be traded before it settles.' },
          ],
        },
        {
          type: 'check',
          question: 'Which situation is most likely to cause a problem for a retail trader?',
          options: ['Holding MES through a normal Tuesday in November', 'Holding a long CL position into its last trading days', 'Rolling ES from December to March a week before expiration', 'Closing a GC position two weeks before first notice day'],
          answer: 1,
          explain: 'CL is physically delivered. Holding a long into the end risks a forced liquidation by the broker or a delivery obligation, and liquidity thins out in the expiring month. The other choices are normal.',
        },
        {
          type: 'order',
          prompt: 'Put the steps of rolling a long ES position in a sensible order.',
          items: ['Check the expiration date and the suggested roll window', 'Sell the expiring front-month contract', 'Buy the next quarterly contract', 'Move your stop-loss and alerts to the new contract'],
          explain: 'Know your dates first, then close the old month and open the new one (or do both at once with a calendar spread), and finally make sure your risk orders point at the contract you now hold.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Continuous charts are stitched together',
          html: `<p>Charting sites often show a "continuous" contract, like <strong>ES1!</strong>, that automatically jumps to the next month at each roll. That is great for looking at long history, but your order always goes to a specific month. At the roll, the continuous chart may show a sudden jump that never happened in any single contract. Know which month your platform is actually trading.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'Which month code means September?', options: ['S', 'Q', 'U', 'V'], answer: 2, explain: 'U is September. Q is August, V is October, and S is not a month code.' },
            { q: 'Equity index futures like ES expire on...', options: ['The last business day of every month', 'The third Friday of March, June, September and December', 'The first Monday of each quarter', 'December 31 each year'], answer: 1, explain: 'They follow the quarterly H, M, U, Z cycle and expire on the third Friday of the contract month.' },
            { q: 'What does it mean that ES is cash-settled?', options: ['You must pay in cash, not by card', 'The contract can only be bought with a cash account', 'You receive shares of all 500 stocks', 'Open positions at expiration are settled by paying the price difference in cash'], answer: 3, explain: 'No stocks change hands. The difference between your price and the final settlement price is credited or debited in cash.' },
            { q: 'Maya is long one March ES contract and wants to stay long through June. What should she do around early-to-mid March?', options: ['Nothing, it renews automatically', 'Buy a second March contract', 'Sell the March contract and buy a June contract', 'Sell the June contract'], answer: 2, explain: 'Futures do not roll automatically. Rolling means closing the expiring month and opening the next quarterly month.' },
            { q: 'Why do retail traders close or roll physically delivered contracts well before the end?', options: ['Brokers generally do not allow retail delivery and may force-liquidate, and liquidity dries up', 'Prices always crash on the last day', 'The exchange charges a large fine for holding to expiration', 'Physically delivered contracts cannot be sold after first notice day'], answer: 0, explain: 'Delivery is built for commercial players. Brokers usually require retail positions to be closed or rolled ahead of FND or the last trading day, and the expiring month gets thin.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 5: Trading hours
    // ------------------------------------------------------------------
    {
      id: 'futures-1-trading-hours',
      title: 'The Market That Barely Sleeps',
      summary: 'Stock index futures trade nearly 23 hours a day, five days a week. Learn the Globex schedule, the Asia, London and New York sessions, and when the action really happens.',
      minutes: 12,
      icon: 'globe',
      steps: [
        {
          type: 'read',
          title: 'The stock market closes. Futures mostly do not.',
          html: `<p>The regular US stock market session runs from 9:30am to 4:00pm Eastern Time. Then most people go home.</p>
<p>Stock index futures keep going. If a big tech company reports earnings at 4:05pm, or a central bank in Asia surprises everyone at 11pm, ES and NQ react <em>right away</em>. By the time the stock market opens the next morning, futures have often already "priced in" a lot of the news.</p>
<p>That is why news anchors say things like "futures are pointing to a lower open." They are reading the overnight futures market, which acts like an early preview of how the stock market is likely to start the day.</p>
<p>Nearly round-the-clock trading is a big reason futures are popular. It is also a big reason people lose sleep over them. Literally.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: "Futures traders in New York, London and Tokyo are all looking at the same price. The market just hands the baton around the planet." },
        },
        {
          type: 'read',
          title: 'The Globex weekly schedule',
          html: `<p>CME Group's electronic platform, Globex, runs equity index futures like ES, NQ and YM on this schedule (Eastern Time):</p>
<ul>
<li><strong>Opens:</strong> Sunday at 6:00pm ET</li>
<li><strong>Daily break:</strong> 5:00pm to 6:00pm ET, Monday through Thursday, for maintenance and daily settlement processing</li>
<li><strong>Closes for the weekend:</strong> Friday at 5:00pm ET</li>
</ul>
<p>So each "trading day" actually starts the evening before. Monday's session begins Sunday at 6:00pm ET.</p>
<p>CME is based in Chicago, so official specs list times in <strong>Central Time</strong>: 5:00pm to 4:00pm CT. Same thing, one hour earlier on the clock. Crude oil and gold run on a very similar Globex schedule, but some products, such as grains, keep shorter hours with their own breaks. Always check the product's page.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Sunday 6pm to Friday 5pm Eastern, with an hour off each evening. That is about 23 hours a day, five days a week." },
        },
        { type: 'diagram', name: 'futures-sessions', caption: 'One futures day wraps around the globe: Asia hours in the US evening, London in the early morning, then New York. Note the one-hour daily break at 5:00pm ET.' },
        {
          type: 'truefalse',
          statement: 'E-mini S&P 500 futures trade 24 hours a day, 7 days a week, just like crypto.',
          answer: false,
          explain: 'They trade nearly 24 hours on weekdays, but there is a daily 5:00 to 6:00pm ET break and the market is closed from Friday 5:00pm ET until Sunday 6:00pm ET.',
        },
        {
          type: 'read',
          title: 'Three sessions, one market',
          html: `<p>Traders loosely split each futures day into three regional sessions. The exact boundaries are informal, but roughly:</p>
<ul>
<li><strong>Asia session:</strong> the US evening and night, when Tokyo, Hong Kong and Sydney are working. Often the quietest stretch for US index futures.</li>
<li><strong>London session:</strong> starts around 3:00am ET. European traders arrive, volume picks up, and big moves sometimes begin here.</li>
<li><strong>New York session:</strong> the US morning and afternoon. This is when most of the day's volume in US index futures happens.</li>
</ul>
<p>Platforms also use two labels you will see on charts: <span class="term" data-def="Regular Trading Hours. For equity index futures, usually the 9:30am to 4:00pm ET window matching the stock market.">RTH</span> for the regular stock market hours, and <span class="term" data-def="Extended or Electronic Trading Hours. All the futures trading outside the regular stock market session.">ETH</span> for everything else, often called "overnight" or "Globex" hours.</p>`,
        },
        {
          type: 'check',
          question: 'It is 3:30am Eastern Time on a Tuesday. Which session is most likely driving trading in ES?',
          options: ['The New York session', 'The London session', 'No session, the market is closed', 'The weekend session'],
          answer: 1,
          explain: 'By 3:30am ET, European markets are open and the London session is underway. Globex is open; the only weekday pause is 5:00 to 6:00pm ET.',
        },
        {
          type: 'read',
          title: 'When the action is heaviest',
          html: `<p>Volume is not spread evenly. For US index futures, the busiest times usually cluster around a few moments (all ET):</p>
<ul>
<li><strong>8:30am:</strong> major US economic reports, like the monthly jobs report and the CPI inflation report. Futures can jump in seconds.</li>
<li><strong>9:30am:</strong> the US stock market opens. The first hour is often the most active of the day.</li>
<li><strong>10:00am:</strong> another batch of data on some days.</li>
<li><strong>2:00pm on Fed days:</strong> the Federal Reserve's rate decision, about eight times a year.</li>
<li><strong>Into 4:00pm:</strong> the stock market close, when lots of funds rebalance.</li>
</ul>
<p>Late morning to early afternoon is often slower, the "lunch lull." Overnight Asia hours are usually thinner still.</p>
<p>Busy moments cut both ways. More volume usually means tighter spreads and easier fills, but the same moments bring the fastest, most violent price swings. At 8:30:00am on jobs-report day, a calm market can turn into a pinball machine in under a second, and stop orders resting near the price can get filled at ugly levels.</p>`,
        },
        {
          type: 'cards',
          title: 'Clock words',
          cards: [
            { front: 'Globex', back: "CME Group's electronic market, open about 23 hours a day on weekdays." },
            { front: 'RTH', back: 'Regular trading hours: 9:30am to 4:00pm ET for equity index futures, matching the stock market.' },
            { front: 'ETH or overnight', back: 'All futures trading outside regular stock hours.' },
            { front: 'Daily break', back: 'The 5:00 to 6:00pm ET pause each weekday evening.' },
            { front: 'Price limit', back: 'A cap on how far some futures can move in a period before trading pauses or is restricted.' },
          ],
        },
        {
          type: 'match',
          prompt: 'Match each Eastern Time to what typically happens then.',
          pairs: [
            { left: '8:30am', right: 'Major economic reports like jobs and CPI' },
            { left: '9:30am', right: 'US stock market opens' },
            { left: '2:00pm (some days)', right: 'Fed interest rate decision' },
            { left: '5:00pm', right: 'Daily Globex maintenance break begins' },
          ],
        },
        {
          type: 'numeric',
          question: 'Maya lives in California (Pacific Time, 3 hours behind Eastern). Globex opens Sunday at 6:00pm ET. What hour is that for her on Sunday, in pm? (Enter just the hour.)',
          answer: 3,
          tolerance: 0,
          unit: '',
          explain: '6:00pm ET minus 3 hours = 3:00pm Pacific Time. Time zones trip up a lot of new traders, so convert everything to your local clock.',
        },
        { type: 'widget', name: 'market-clock', props: {}, caption: 'This live clock shows which US stock session is open right now in Eastern Time. Futures keep trading through most of the hours the stock market is closed.' },
        {
          type: 'read',
          title: 'The overnight trap',
          html: `<p>Overnight trading is real, but it is different:</p>
<ul>
<li><strong>Thinner liquidity.</strong> Fewer traders means wider spreads and bigger jumps between prices.</li>
<li><strong>Surprise news.</strong> An earnings miss, a geopolitical event, or a foreign central bank can move prices sharply while you are asleep.</li>
<li><strong>Slippage on stops.</strong> A stop order in a thin market can fill far worse than its trigger price.</li>
</ul>
<p>To slow down extreme moves, CME applies a <strong>price limit of 7% up or down</strong> on equity index futures outside regular US stock hours. That is a speed bump, not a safety net: a 7% move on one ES at 6,000 is 420 points, or $21,000.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Holding futures overnight means letting the whole planet trade against you while you sleep. Size like you know that." },
        },
        {
          type: 'read',
          title: 'Holidays: check the calendar',
          html: `<p>US holidays do not shut futures down in a simple, uniform way. On many holidays, Globex has <strong>shortened hours</strong> or an <strong>early close</strong> instead of a full closure, and the exact schedule <span class="hl">varies by product</span>. Equity index futures, crude oil, grains and Treasuries can each have different hours on the same holiday. The day after Thanksgiving, for example, usually has an early close for many products.</p>
<p>CME publishes a holiday calendar listing each product's hours. Check it before any holiday week, especially if you plan to hold a position over a long weekend, when the market is closed longer and news keeps happening.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Rule: do not assume holiday hours. Look them up on CME's calendar. Every holiday. Every product." },
        },
        {
          type: 'order',
          prompt: 'Put these moments of a typical weekday futures cycle in order, starting from the evening before (all ET).',
          items: ['6:00pm: Globex reopens after the daily break', 'Overnight: Asia session trading', 'Around 3:00am: London session picks up', '8:30am: US economic reports', '9:30am: US stock market opens', '5:00pm: daily break begins'],
          explain: 'A futures day starts the evening before at 6:00pm ET, rolls through Asia and London, hits the US data and stock open, and ends at the 5:00pm ET break.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'You do not have to be awake for all of it',
          html: `<p>Dev tried to watch futures "whenever they were open." Within two weeks he was trading tired at 1:00am and making choices he would never make rested. Most experienced day traders pick one window, often the first couple hours of the New York session, and ignore the rest. A market open 23 hours a day is not an invitation to trade 23 hours a day.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'When does CME Globex open for the trading week for equity index futures?', options: ['Monday 9:30am ET', 'Sunday 6:00pm ET', 'Sunday midnight ET', 'Monday 4:00am ET'], answer: 1, explain: 'The week opens Sunday at 6:00pm ET (5:00pm CT), and that session counts as Monday.' },
            { q: 'What happens from 5:00pm to 6:00pm ET Monday through Thursday?', options: ['The busiest trading hour', 'Only hedgers may trade', 'A daily maintenance break when Globex index futures do not trade', 'The London session opens'], answer: 2, explain: 'Globex takes a daily one-hour break for maintenance and settlement processing.' },
            { q: 'Why is 8:30am ET often a high-volatility moment?', options: ['Major US economic reports are released then', 'The stock market opens then', 'Futures expire every day at 8:30am', 'Asian markets open then'], answer: 0, explain: 'Reports like the jobs report and CPI come out at 8:30am ET. The stock market opens at 9:30am.' },
            { q: 'Which is a real risk of holding futures overnight?', options: ['Futures cannot be sold overnight', 'Thin liquidity and surprise news can cause big gaps and slippage', 'Overnight trades are reversed in the morning', 'Overnight prices do not count toward your P&L'], answer: 1, explain: 'Overnight markets are thinner, so news can move prices sharply and stops can fill well past their trigger.' },
            { q: 'Leo wants to hold ES over the Thanksgiving holiday. What should he do first?', options: ['Assume the market is closed all four days', 'Assume normal hours since futures trade nearly 24 hours', 'Ask Dev', "Check CME's holiday calendar for that product's exact hours"], answer: 3, explain: 'Holiday hours vary by product and year. The exchange calendar is the source of truth.' },
          ],
        },
      ],
    },
  ],
  bossQuestions: [
    { q: 'Dev buys 3 MNQ at 21,000.00 and sells at 20,962.50. What is his result before fees?', options: ['-$75', '-$225', '-$750', '-$2,250'], answer: 1, explain: 'The move is -37.5 points. MNQ is $2 per point, so 37.5 x $2 x 3 = $225 lost.' },
    { q: 'Ms. Ortiz wants to hedge rising wheat costs and avoid any chance of receiving wheat. What fits best?', options: ['Short wheat futures and hold through delivery', 'Long wheat futures held into the delivery period', 'Long wheat futures, closed or rolled well before first notice day', 'Buy ES futures, since they are cash-settled'], answer: 2, explain: 'A long hedge protects against rising prices. Closing or rolling before first notice day avoids delivery. ES would not hedge wheat at all.' },
    { q: 'Which ticker represents the contract an S&P 500 futures trader would most likely roll into after ESZ6 expires?', options: ['ESF7', 'ESZ7', 'ESM7', 'ESH7'], answer: 3, explain: 'Equity index futures are quarterly (H, M, U, Z). After December 2026 comes March 2027, which is ESH7.' },
    { q: 'Which statement about futures participants is most accurate?', options: ['Speculators provide liquidity that helps hedgers trade at fair prices', 'Hedgers only ever take short positions', 'Speculators always lose because the market is zero-sum', 'Hedgers judge a hedge purely by whether the futures leg made money'], answer: 0, explain: 'Speculators take the other side of hedging trades and keep markets liquid. Hedgers can be long or short, and a hedge is judged by the combined result.' },
    { q: 'Gold (GC, 100 oz) rises from $3,950.00 to $3,962.40 while Leo is short 2 contracts. What is his result?', options: ['-$1,240', '-$2,480', '-$248', '+$2,480'], answer: 1, explain: 'The move is $12.40 per ounce. $12.40 x 100 oz = $1,240 per contract, x 2 = $2,480. He is short and price rose, so it is a loss.' },
  ],
};
