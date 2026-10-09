// Unit 4: Futures. Chapter 2: Margin, Leverage & Not Blowing Up.
export default {
  id: 'futures-ch2',
  title: 'Margin, Leverage & Not Blowing Up',
  blurb: 'How futures margin really works, why small moves become big dollars, and how traders size positions so one bad day does not end everything.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1: Margin is a performance bond
    // ------------------------------------------------------------------
    {
      id: 'futures-2-margin-basics',
      title: 'Margin Is a Deposit, Not a Loan',
      summary: 'Futures margin is a good-faith deposit that proves you can cover losses. Learn initial vs maintenance margin, day-trading margins, and why the deposit is so small compared to what you control.',
      minutes: 13,
      icon: 'lock',
      steps: [
        {
          type: 'read',
          title: 'Same word, different meaning',
          html: `<p>In the stock world, "buying on margin" means <strong>borrowing</strong> money from your broker to buy more shares, and paying interest on that loan.</p>
<p>In futures, <span class="term" data-def="In futures, a good-faith deposit you must keep in your account to cover possible losses on open positions. Not a loan.">margin</span> means something completely different. Nobody lends you anything. Futures margin is a <span class="hl">performance bond</span>: a deposit that sits in your account to show you can cover the losses your position might create.</p>
<p>Think of it like the security deposit on an apartment. You are not paying for the apartment with it. It is there so the landlord is covered if you trash the place. In futures, the "landlord" is the clearinghouse, and "trashing the place" is the market moving against you.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Stock margin: a loan. Futures margin: a deposit. Same word, totally different animal. Finance loves reusing words to confuse people." },
        },
        {
          type: 'read',
          title: 'Nobody pays the full price up front',
          html: `<p>When Leo buys one ES contract, he does not hand over the full value of the S&amp;P 500 exposure he controls. Neither does the person who sold it to him. <strong>Both sides</strong> post margin.</p>
<p>Why? Because a futures contract is a promise about the future, not a purchase today. The full exchange of money (or goods) only happens at settlement. Until then, the clearinghouse just needs confidence that whoever ends up losing can pay.</p>
<p>So the buyer is not "buying" anything yet, and the seller is not "selling" anything yet. They are each locking in a price and posting a deposit as proof they are good for the difference. That is also why a short seller in futures does not need to borrow anything first, unlike shorting a stock.</p>`,
        },
        {
          type: 'truefalse',
          statement: 'When you post futures margin, your broker is lending you the rest of the contract value and charging you interest on it.',
          answer: false,
          explain: 'Futures margin is a performance bond, not a down payment on a loan. There is no borrowed balance on a futures position, so there is no margin interest the way there is with stock margin.',
        },
        {
          type: 'read',
          title: 'Initial and maintenance margin',
          html: `<p>There are two key levels:</p>
<ul>
<li><span class="term" data-def="The amount you must have in your account to open a futures position.">Initial margin</span>: what you need in your account to <strong>open</strong> a position (and hold it overnight).</li>
<li><span class="term" data-def="The minimum account level you must stay above while holding a position. Drop below it and you get a margin call.">Maintenance margin</span>: the minimum you must <strong>keep</strong> while holding it. Initial is set a bit higher than maintenance.</li>
</ul>
<p>The exchange's clearinghouse sets these levels using risk models based on how much the contract tends to move. Brokers can, and often do, require more than the exchange minimum.</p>
<p>Here are <strong>illustrative numbers only</strong>, roughly in the range seen in recent years. Real margins change often, so always check the current figures with CME Group and your broker:</p>
<table>
<thead><tr><th>Contract</th><th>Initial (illustrative)</th><th>Maintenance (illustrative)</th></tr></thead>
<tbody>
<tr><td>ES</td><td>about $24,000</td><td>about $22,000</td></tr>
<tr><td>MES</td><td>about $2,400</td><td>about $2,200</td></tr>
</tbody>
</table>`,
        },
        {
          type: 'cards',
          title: 'Margin words',
          cards: [
            { front: 'Performance bond', back: 'Another name for futures margin: a deposit that guarantees you can cover losses.' },
            { front: 'Initial margin', back: 'The deposit needed to open a position and hold it overnight.' },
            { front: 'Maintenance margin', back: 'The minimum account level while holding a position. Fall below it and you face a margin call.' },
            { front: 'Excess', back: 'Money in your account above the margin requirement. Your cushion.' },
            { front: 'Day-trading margin', back: 'A lower, broker-set requirement for positions opened and closed within the same session.' },
          ],
        },
        {
          type: 'check',
          question: 'What is the difference between initial and maintenance margin?',
          options: ['Initial is paid to the exchange as a fee; maintenance is refunded', 'Initial is needed to open a position; maintenance is the minimum you must keep while holding it', 'Initial is for buyers; maintenance is for sellers', 'They are two names for the same number'],
          answer: 1,
          explain: 'You need initial margin to get in. While you hold the position, your account must stay above the slightly lower maintenance level. Margin is a deposit, not a fee, and buyers and sellers post the same requirements.',
        },
        {
          type: 'read',
          title: 'Why is the deposit so small?',
          html: `<p>One ES at an index level of 6,000 controls $300,000 of S&amp;P 500 exposure (6,000 x $50). Using the illustrative maintenance margin of about $22,000, that is only around <strong>7%</strong> of the contract's value.</p>
<p>The clearinghouse can get away with a small deposit because of <strong>daily settlement</strong>. Every day, losses are collected in cash from the losing side (the next lesson covers this). So the margin only needs to cover roughly what the contract might lose in a day or two of bad moves, not its entire value.</p>
<p>That is clever risk management for the clearinghouse. For you, it creates <span class="hl">leverage</span>: a small amount of money controlling a large amount of exposure. Leverage is the reason futures can make or lose money so quickly.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: "About $22,000 steering a $300,000 position. That is like driving a semi truck with a learner's permit." },
        },
        {
          type: 'numeric',
          question: 'One MES at an index level of 6,000 controls $30,000 of exposure. If maintenance margin is an illustrative $2,200, what percent of the notional value is that? (Round to one decimal.)',
          answer: 7.3,
          tolerance: 0.1,
          unit: '%',
          explain: '$2,200 / $30,000 = 0.0733, or about 7.3%. MES margin is about one tenth of ES margin, because the contract is one tenth the size.',
        },
        {
          type: 'callout',
          variant: 'example',
          title: "Leo's cushion",
          html: `<p>Leo has $10,000 in his futures account and holds 1 MES overnight. With an illustrative initial margin of $2,400, about $7,600 is <strong>excess</strong>, money above the requirement. Every dollar his position loses comes out of that cushion first. The bigger the cushion compared to his position, the more room he has to be wrong without the broker stepping in.</p>`,
        },
        {
          type: 'read',
          title: 'Day-trading margins: the tempting discount',
          html: `<p>Many futures brokers offer much lower <strong>day-trading margins</strong> for positions opened and closed in the same session. Depending on the broker, this might be something like a few hundred dollars per ES or under a hundred dollars per MES. These are set by the broker, not the exchange, and they vary widely, so check yours.</p>
<p>The catch: you must close before the session ends (or before a cutoff your broker sets). If you are still holding at that point, the full exchange initial margin applies. If your account cannot cover it, the broker will usually close the position for you.</p>
<p>A low day-trading margin does <strong>not</strong> make the trade smaller. One ES still moves $50 per point whether you posted $24,000 or $500. The only thing that changed is how thin your cushion is.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A $500 margin on ES is not a discount. It is a trapdoor. Twelve points against you and that $500 is gone." },
        },
        {
          type: 'match',
          prompt: 'Match each decision to who usually makes it.',
          pairs: [
            { left: 'Exchange minimum initial and maintenance margins', right: 'The clearinghouse' },
            { left: 'Intraday day-trading margin levels', right: 'Your broker' },
            { left: 'Extra requirements above the exchange minimum', right: 'Your broker' },
            { left: 'How much cushion to keep beyond the requirement', right: 'You' },
          ],
        },
        {
          type: 'read',
          title: 'Margins move when markets get scary',
          html: `<p>Margin requirements are not fixed. When volatility rises, clearinghouses raise margins, sometimes sharply and with little notice. During the market turmoil of early 2020, for example, CME raised margins on many contracts as prices swung wildly.</p>
<p>This creates a nasty surprise: your account can face a margin shortfall even if your position has <em>not</em> lost money, simply because the requirement went up. And it tends to happen exactly when markets are already stressful.</p>
<p>That is one more reason experienced traders keep plenty of money in the account beyond the minimum, instead of running right at the edge.</p>`,
        },
        {
          type: 'numeric',
          question: 'Leo wants to hold 3 MES overnight. Using an illustrative initial margin of $2,400 per MES, how much initial margin does he need in total?',
          answer: 7200,
          tolerance: 0.01,
          unit: '$',
          explain: '3 contracts x $2,400 = $7,200. If his account is $10,000, he has $2,800 of excess as a cushion against losses.',
        },
        {
          type: 'callout',
          variant: 'warn',
          title: 'Affording the margin is not affording the trade',
          html: `<p>The margin requirement tells you the <em>minimum</em> needed to open a position. It says nothing about whether you can survive a bad day. If Leo has exactly $7,200 for those 3 MES, the first wiggle against him puts him on the edge of a margin call. A good question is not "Can I meet the margin?" but "How much could this cost me if I am wrong, and can I live with that?"</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'Futures margin is best described as...', options: ['A loan from your broker', 'A fee paid to the exchange', 'A good-faith deposit that guarantees you can cover losses', 'The full price of the contract'], answer: 2, explain: 'It is a performance bond. You are not borrowing money and it is not a fee; it stays your money unless losses use it up.' },
            { q: 'Who posts margin on a futures trade?', options: ['Only the buyer', 'Only the seller', 'Only speculators', 'Both the buyer and the seller'], answer: 3, explain: 'Both sides have obligations, so both sides post margin with the clearinghouse through their brokers.' },
            { q: 'Why can futures margins be a small percentage of notional value?', options: ['Because gains and losses are settled in cash every day', 'Because futures prices cannot move more than 1% a day', 'Because the broker insures all losses', 'Because only professionals trade futures'], answer: 0, explain: 'Daily settlement means margin only needs to cover a day or two of potential losses, not the whole contract value.' },
            { q: 'Dev opens 1 ES using a $500 day-trading margin. How much is ES worth per point to him?', options: ['$5', '$50', '$12.50', 'It depends on his margin'], answer: 1, explain: 'ES is always $50 per point. Lower margin does not shrink the contract; it only shrinks your cushion.' },
            { q: 'Maya reads that ES initial margin is $24,000. What should she keep in mind?', options: ['That number is fixed by law', 'Margins can change, brokers may require more, so check current numbers', 'Margin only applies to short positions', 'Initial margin is lower than maintenance margin'], answer: 1, explain: 'Clearinghouses adjust margins as volatility changes, and brokers can require more. Initial is set above maintenance, not below.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 2: Mark-to-market
    // ------------------------------------------------------------------
    {
      id: 'futures-2-mark-to-market',
      title: 'Mark-to-Market: The Daily Scoreboard',
      summary: 'In futures, gains and losses are settled in cash every single day. See how daily settlement works and why you cannot pretend a losing trade is fine.',
      minutes: 12,
      icon: 'receipt',
      steps: [
        {
          type: 'read',
          title: 'No "paper losses" here',
          html: `<p>When you own a stock that drops, you might tell yourself, "It is only a paper loss. I have not sold yet." The money has not left your account in any concrete way.</p>
<p>Futures do not allow that story. At the end of every trading day, each open position is <span class="term" data-def="Revaluing an open position at the current market price and settling the gain or loss in cash.">marked to market</span>: revalued at the official daily settlement price, with gains and losses moved <strong>in cash</strong>.</p>
<p>If your position lost $300 today, $300 actually leaves your account tonight. If it gained $300, $300 actually arrives. Every day, the scoreboard resets and the money moves.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Futures keep score every single day. It is like a video game that saves your progress at 5pm, even when you would rather it did not." },
        },
        {
          type: 'read',
          title: 'How the money moves',
          html: `<p>Here is the daily routine:</p>
<ol>
<li>The exchange sets a <span class="term" data-def="The official end-of-day price the exchange uses to mark every open position.">settlement price</span> for each contract, based on trading near the end of the day. For ES, that is around the 4:00pm ET stock market close.</li>
<li>The clearinghouse compares each position to the previous settlement (or to the entry price, on the first day).</li>
<li>Losing accounts pay. Winning accounts receive. This cash flow is called <span class="term" data-def="The daily cash payment that settles futures gains and losses.">variation margin</span>.</li>
<li>Brokers update customer accounts, and anyone who falls below maintenance margin is flagged.</li>
</ol>
<p>Because the market is zero-sum, the money paid by losers equals the money received by winners, before fees. The clearinghouse is the pipe it flows through.</p>`,
        },
        { type: 'diagram', name: 'mark-to-market', caption: 'Each day the position is revalued at the settlement price. Cash moves from the losing side to the winning side, and the starting point resets for tomorrow.' },
        {
          type: 'read',
          title: 'Same exposure, different plumbing',
          html: `<p>Compare two ways to bet on the S&amp;P 500 with about $30,000 of exposure.</p>
<p><strong>Maya's mom buys $30,000 of an S&amp;P 500 index fund.</strong> She pays the full $30,000 up front. If the index falls 3%, her fund shows $29,100. Nothing moves in or out of her account. She can ignore it for years if she wants.</p>
<p><strong>Leo holds 1 MES at 6,000.</strong> He posts a margin deposit, not $30,000. If the index falls 3% (180 points), $900 is <em>removed</em> from his account that evening. If it falls again tomorrow, more cash leaves tomorrow.</p>
<p>The economic exposure is almost the same. The plumbing is completely different. The fund investor paid in full and can wait. The futures trader paid a deposit and gets billed daily. That daily bill is the price of using so little money up front.</p>`,
        },
        {
          type: 'read',
          title: "Leo's week, day by day",
          html: `<p>Leo buys 1 MES ($5 per point) on Monday at 6,000. Watch the cash move:</p>
<table>
<thead><tr><th>Day</th><th>Settlement</th><th>Change</th><th>Cash that day</th><th>Running total</th></tr></thead>
<tbody>
<tr><td>Mon</td><td>6,020</td><td>+20</td><td><span class="up">+$100</span></td><td>+$100</td></tr>
<tr><td>Tue</td><td>5,990</td><td>-30</td><td><span class="down">-$150</span></td><td>-$50</td></tr>
<tr><td>Wed</td><td>5,970</td><td>-20</td><td><span class="down">-$100</span></td><td>-$150</td></tr>
<tr><td>Thu</td><td>6,010</td><td>+40</td><td><span class="up">+$200</span></td><td>+$50</td></tr>
</tbody>
</table>
<p>He sells Thursday at 6,010. Total: 10 points x $5 = <strong>$50</strong>, the same as if he had just compared entry and exit. Mark-to-market does not change the final result. It changes <span class="hl">when</span> the cash moves: in daily installments.</p>`,
        },
        {
          type: 'numeric',
          question: 'Suppose Leo had kept his MES through Friday and it settled at 5,995 (Thursday settled at 6,010). How much cash moves for Friday alone? Enter a negative number for a loss.',
          answer: -75,
          tolerance: 0.01,
          unit: '$',
          explain: '5,995 - 6,010 = -15 points. -15 x $5 = -$75 leaves his account Friday.',
        },
        {
          type: 'check',
          question: 'Why does the clearinghouse settle gains and losses every day instead of at expiration?',
          options: ['To collect extra fees', 'To stop losses from piling up so the losing side can always pay', 'Because traders are required to close every position daily', 'So that prices cannot move more than a set amount'],
          answer: 1,
          explain: 'Collecting losses daily keeps any one account from building up a huge unpaid debt. That is what lets the clearinghouse guarantee every trade with relatively small margins.',
        },
        {
          type: 'read',
          title: 'Winning cash is real cash',
          html: `<p>Mark-to-market works in your favor too. If your position gains, that variation margin lands in your account as cash after settlement. Money above your margin requirement is <strong>excess</strong>, and brokers generally let you withdraw it, even though the position is still open.</p>
<p>Some traders like this. Others find it dangerous, because it is easy to treat open profits as "safe" and spend or reuse them. They are not safe. Tomorrow's move can take them right back.</p>
<p>Mark-to-market also matters for taxes. In the US, futures that qualify as Section 1256 contracts are treated as if they were sold at year end, so open gains and losses count for that tax year. Chapter 3 covers that, with the usual reminder to confirm with a tax professional.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Fun fact: mark-to-market is the whole reason futures can use small margins. Daily settlement keeps unpaid losses from stacking up." },
        },
        {
          type: 'truefalse',
          statement: 'If Dev is holding a losing futures position, he has not really lost any money until he closes it.',
          answer: false,
          explain: 'In futures, losses are settled in cash every day. The money has already left his account, whether or not he closes the trade.',
        },
        {
          type: 'read',
          title: 'Why daily settlement messes with your head',
          html: `<p>Mark-to-market is fair, but it can be brutal psychologically.</p>
<p>Imagine Dev is long, and the market drifts against him for four straight days. Each evening, cash drains out of his account. He is "sure" it will come back. But if the drain pushes him below maintenance margin, he must deposit more money or get closed out, <em>even if the price later recovers</em>.</p>
<p>A stock investor might be able to sit through a dip. A leveraged futures trader often cannot, because the daily cash calls force the decision. Being right eventually does not help if you were knocked out first.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "The market does not care that you will be right next week. It collects tonight. Plan for the drawdown, not just the destination." },
        },
        {
          type: 'order',
          prompt: 'Put the daily settlement process in order.',
          items: ['Trading continues through the day', 'The exchange sets the daily settlement price', 'Each position is revalued against the prior settlement', 'Cash moves from losing accounts to winning accounts', 'Accounts below maintenance margin get flagged for a margin call'],
          explain: 'Settlement price first, then revaluation, then cash transfers, then margin checks. The next day starts fresh from the new settlement price.',
        },
        {
          type: 'cards',
          title: 'Settlement words',
          cards: [
            { front: 'Mark-to-market', back: 'Revaluing open positions at the daily settlement price and settling gains and losses in cash.' },
            { front: 'Settlement price', back: 'The official end-of-day price the exchange uses for all open positions.' },
            { front: 'Variation margin', back: 'The daily cash paid or received because of price changes.' },
            { front: 'Open trade equity', back: 'The current gain or loss on positions you still hold.' },
          ],
        },
        {
          type: 'callout',
          variant: 'example',
          title: 'How a slow drift becomes a crisis',
          html: `<p>Dev has $2,700 in his account and holds 1 MES overnight, using illustrative margins of $2,400 initial and $2,200 maintenance. The market slips 40 points on Monday ($200), 30 on Tuesday ($150), and 25 on Wednesday ($125). No single day looks scary. But after three settlements his account is $2,225, a hair above maintenance. One more ordinary down day and he faces a margin call. Small daily losses add up, and mark-to-market makes sure you feel each one.</p>`,
        },
        {
          type: 'read',
          title: 'Why the system rarely breaks',
          html: `<p>Daily settlement plus margin is why futures clearinghouses have a strong safety record. Losses get collected before they can grow huge, and if a trader cannot pay, their broker is on the hook to the clearinghouse. Behind that sit more layers, like guarantee funds that clearing member firms contribute to.</p>
<p>None of that protects <em>you</em> from losing your own money. It protects the system from one trader's losses spreading to everyone else. If your account goes negative, the clearinghouse still pays the winners, and your broker comes to you for the difference. Your protection is your position size.</p>`,
        },
        {
          type: 'numeric',
          question: 'Maya paper-trades short 2 MES at 6,050. That day ES futures settle at 6,032. How much variation margin does her paper account receive?',
          answer: 180,
          tolerance: 0.01,
          unit: '$',
          explain: 'The price fell 18 points, which helps a short. 18 x $5 x 2 contracts = $180.',
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What does mark-to-market mean in futures?', options: ['Prices are set by a market maker', 'Open positions are revalued daily and gains or losses settle in cash', 'You can only trade at the closing price', 'Your broker estimates your profit at expiration'], answer: 1, explain: 'Each day positions are marked to the settlement price and cash moves accordingly.' },
            { q: 'Leo buys 1 MES at 6,100. Day 1 settles at 6,080, day 2 at 6,110. What is his total P&L after day 2?', options: ['+$150', '-$100', '+$50', '+$550'], answer: 2, explain: 'Day 1: -20 x $5 = -$100. Day 2: +30 x $5 = +$150. Total +$50, which equals (6,110 - 6,100) x $5.' },
            { q: 'What is variation margin?', options: ['The initial deposit to open a trade', 'A fee for holding overnight', 'Extra margin required on volatile days only', 'The daily cash payment that settles gains and losses'], answer: 3, explain: 'Variation margin is the cash moved each day based on price changes.' },
            { q: 'Why can daily settlement force a trader out of a position that later recovers?', options: ['Losses drain cash daily, which can trigger margin calls before the recovery', 'The exchange closes all losing positions each night', 'Positions expire after five losing days', 'Recoveries do not count in futures'], answer: 0, explain: 'If cumulative losses push the account below maintenance, the trader must add money or get liquidated, regardless of what happens later.' },
            { q: 'Which statement is true about mark-to-market?', options: ['It increases your total profit compared to a stock', 'It changes the final P&L of a trade', 'It changes when cash moves, not the total gain or loss', 'It only applies to losing positions'], answer: 2, explain: 'The total from entry to exit is the same. Mark-to-market splits it into daily cash installments, for winners and losers alike.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 3: Leverage math
    // ------------------------------------------------------------------
    {
      id: 'futures-2-leverage-math',
      title: 'Leverage Math: Small Moves, Big Dollars',
      summary: 'Notional value, leverage ratios, and what a 1% move really does to your account. The math that separates traders who last from traders who do not.',
      minutes: 14,
      icon: 'scale',
      steps: [
        {
          type: 'read',
          title: 'What you control vs what you put up',
          html: `<p>Two numbers describe every futures position:</p>
<ul>
<li><strong>What you put up:</strong> the margin, a few thousand dollars or less.</li>
<li><strong>What you control:</strong> the <span class="term" data-def="The total value of the exposure a contract represents: price x multiplier (or price x quantity).">notional value</span>, often tens or hundreds of thousands of dollars.</li>
</ul>
<p>The formula is simple: <span class="hl">notional value = price x multiplier</span>. For physical contracts, price x quantity.</p>
<p>Your profits and losses come from the notional value, not from the margin. That is the whole story of leverage in one sentence.</p>`,
          sprite: { who: 'chip', mood: 'think', say: "Margin is the ticket. Notional is the ride. You pay for the ticket, but you feel every drop of the ride." },
        },
        {
          type: 'read',
          title: 'Notional values, worked out',
          html: `<p>Using round example prices (actual prices will differ when you read this):</p>
<table>
<thead><tr><th>Contract</th><th>Example price</th><th>Math</th><th>Notional</th></tr></thead>
<tbody>
<tr><td>ES</td><td>6,000</td><td>6,000 x $50</td><td>$300,000</td></tr>
<tr><td>MES</td><td>6,000</td><td>6,000 x $5</td><td>$30,000</td></tr>
<tr><td>NQ</td><td>21,000</td><td>21,000 x $20</td><td>$420,000</td></tr>
<tr><td>MNQ</td><td>21,000</td><td>21,000 x $2</td><td>$42,000</td></tr>
<tr><td>CL</td><td>$70</td><td>$70 x 1,000 barrels</td><td>$70,000</td></tr>
<tr><td>GC</td><td>$4,000</td><td>$4,000 x 100 oz</td><td>$400,000</td></tr>
</tbody>
</table>
<p>Even a single <em>micro</em> contract controls more money than many people have in their whole savings account. And notional changes as the price moves: if the S&amp;P 500 rises from 6,000 to 6,600, one ES now controls $330,000. The contract quietly gets bigger as markets climb, which is one reason margin requirements drift over time.</p>
<p>When people say "I only have $2,000 in that trade," they usually mean the margin. The market sees the notional.</p>`,
        },
        {
          type: 'numeric',
          question: 'NQ is trading at 20,500. What is the notional value of one NQ contract ($20 x index)?',
          answer: 410000,
          tolerance: 0.01,
          unit: '$',
          explain: '20,500 x $20 = $410,000.',
        },
        {
          type: 'read',
          title: 'The leverage ratio',
          html: `<p>A handy number is the <span class="term" data-def="Notional value divided by the money backing the position. Shows how many dollars of exposure each of your dollars controls.">leverage ratio</span>: notional value divided by the money backing it.</p>
<ul>
<li>One ES ($300,000 notional) backed by an illustrative $22,000 maintenance margin: about <strong>13.6 to 1</strong>.</li>
<li>The same ES backed by a $500 day-trading margin: <strong>600 to 1</strong>.</li>
<li>One MES ($30,000 notional) in a $30,000 account: <strong>1 to 1</strong>, about the same exposure as owning $30,000 of an S&amp;P 500 index fund.</li>
</ul>
<p>Notice that the contract did not change in any of these. What changed is how much money stands behind it. The more cash you hold relative to notional, the lower your real leverage. That is why the same futures contract can be a sensible tool in one account and a ticking bomb in another. The contract is neutral. The account size around it decides the danger.</p>`,
        },
        {
          type: 'numeric',
          question: 'Maya has a $3,000 practice account and holds 1 MES at an index level of 6,000. What is her leverage ratio (notional / account)? Enter just the number.',
          answer: 10,
          tolerance: 0.01,
          unit: '',
          explain: 'Notional is 6,000 x $5 = $30,000. $30,000 / $3,000 = 10, so 10 to 1.',
        },
        { type: 'widget', name: 'futures-leverage', props: { contract: 'MES' }, caption: 'Try MES first, then switch to ES and NQ. Move the price a little and compare the dollar change to the margin you would post.' },
        {
          type: 'read',
          title: 'What a 1% move really means',
          html: `<p>A 1% move in the S&amp;P 500 is a normal day. Not a crash. Not news. Just a Tuesday. At an index level of 6,000:</p>
<ul>
<li>1% = 60 points.</li>
<li>On 1 ES: 60 x $50 = <strong>$3,000</strong>.</li>
<li>On 1 MES: 60 x $5 = <strong>$300</strong>.</li>
</ul>
<p>Compare that to the money behind each position:</p>
<ul>
<li>ES with an illustrative $22,000 margin: a 1% move is about <strong>14% of the margin</strong>.</li>
<li>ES with a $500 day-trading margin: a 1% move is <span class="down">600% of the deposit</span>. Gone six times over.</li>
</ul>
<p>Leverage multiplies the percentage. A 1% market move becomes a 14% or 600% account move, depending entirely on how much cash is behind the contract.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A 1% day is boring for the index and catastrophic for an overleveraged account. Same move. Your size decides which story you get." },
        },
        {
          type: 'numeric',
          question: 'The S&P 500 futures fall 2% from 6,000. How much does one long MES lose?',
          answer: 600,
          tolerance: 0.01,
          unit: '$',
          explain: '2% of 6,000 = 120 points. 120 x $5 = $600.',
        },
        {
          type: 'read',
          title: 'Big days are not that rare',
          html: `<p>It is tempting to think large moves are rare freak events. History disagrees:</p>
<ul>
<li>Daily moves of 1% or more in the S&amp;P 500 are common, especially in volatile years.</li>
<li>On March 16, 2020, the S&amp;P 500 fell about 12% in a single day as the pandemic hit markets.</li>
<li>On October 19, 1987, "Black Monday," it fell about 20% in one day.</li>
</ul>
<p>A 12% drop at an index level of 6,000 is 720 points: <strong>$36,000</strong> on one ES, or <strong>$3,600</strong> on one MES. Any trading plan has to survive days like that, not just average days.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "Rare events show up more often than most people expect. Markets have a sense of humor, and it is mostly dark." },
        },
        {
          type: 'check',
          question: 'Which trader has the highest real leverage?',
          options: ['Leo: 1 MES in a $30,000 account', 'Maya: 1 MES in a $10,000 account', 'Dev: 1 ES in a $10,000 account', 'Ms. Ortiz: 2 MES in a $20,000 account'],
          answer: 2,
          explain: 'At 6,000: Leo $30,000 / $30,000 = 1x. Maya $30,000 / $10,000 = 3x. Dev $300,000 / $10,000 = 30x. Ms. Ortiz $60,000 / $20,000 = 3x. Dev is far more leveraged.',
        },
        {
          type: 'read',
          title: 'Think in notional, not in margin',
          html: `<p>Here is the mindset shift that protects accounts. Do not ask, "How many contracts can my margin cover?" Ask, <span class="hl">"How much exposure am I really taking compared to my whole account?"</span></p>
<p>Leo has $10,000. He holds 2 MES at 6,000. That is $60,000 of notional, or <strong>6 times</strong> his account. A 5% drop in the S&amp;P 500 (300 points) would cost him 300 x $5 x 2 = $3,000, which is 30% of his account.</p>
<p>Is that okay? That is his call. But at least he is making it with real numbers, not with "the margin is only $4,800, so I am fine."</p>`,
        },
        {
          type: 'numeric',
          question: 'Leo has $10,000 and holds 2 MES at 6,000. What is his effective leverage (total notional / account)?',
          answer: 6,
          tolerance: 0.01,
          unit: '',
          explain: '2 x 6,000 x $5 = $60,000 notional. $60,000 / $10,000 = 6.',
        },
        {
          type: 'callout',
          variant: 'myth',
          title: 'Myth: leverage only matters when you lose',
          html: `<p>Leverage magnifies gains and losses equally. That symmetry sounds fair, but losses hurt more in practice: a 50% loss needs a 100% gain just to get back to even, and margin calls can force you out before you ever get the chance. Leverage also magnifies emotions. Watching $3,000 swing on a normal day makes clear thinking much harder.</p>`,
        },
        {
          type: 'read',
          title: 'Leverage is a tool, not a villain',
          html: `<p>None of this means leverage is evil. Professionals use it constantly, often to <em>reduce</em> risk.</p>
<p>A pension fund that wants to trim its stock exposure for a few weeks can sell index futures instead of selling hundreds of stocks, then buy them back later. Ms. Ortiz can hedge a large amount of wheat cost with a small deposit and keep the rest of her cash running the bakery. That is called <span class="term" data-def="Getting a lot of exposure, or protection, for a small amount of capital tied up.">capital efficiency</span>.</p>
<p>The difference is intent and size. Hedgers use leverage to offset a risk they already have. Speculators who max out leverage are adding risk on top of nothing. Same tool, very different results.</p>`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The four-number check',
          html: `<p>Before any futures position, work out four numbers: <strong>1)</strong> total notional value, <strong>2)</strong> notional divided by your account, <strong>3)</strong> the dollar loss on a normal 1% move, and <strong>4)</strong> the dollar loss on a rare 10% move. If number 4 would end your trading, the position is too big for your account, no matter what the margin requirement says.</p>`,
        },
        {
          type: 'match',
          prompt: 'Match each position to its notional value at an index level of 6,000.',
          pairs: [
            { left: '1 ES', right: '$300,000' },
            { left: '1 MES', right: '$30,000' },
            { left: '3 MES', right: '$90,000' },
            { left: '2 ES', right: '$600,000' },
          ],
        },
        {
          type: 'quiz',
          questions: [
            { q: 'How is notional value calculated for an index future?', options: ['Margin x 10', 'Price x multiplier', 'Tick size x tick value', 'Account size x leverage'], answer: 1, explain: 'Notional = price x multiplier. For ES at 6,000, that is 6,000 x $50 = $300,000.' },
            { q: 'ES is at 6,000. Roughly how much does one contract gain or lose on a 1% move?', options: ['$300', '$600', '$30,000', '$3,000'], answer: 3, explain: '1% of 6,000 = 60 points x $50 = $3,000.' },
            { q: 'Dev controls $300,000 of notional with a $500 day-trading margin. What is his leverage on that deposit?', options: ['600 to 1', '60 to 1', '30 to 1', '6 to 1'], answer: 0, explain: '$300,000 / $500 = 600. A move of just 10 points ($500) on ES wipes out the deposit.' },
            { q: 'What lowers your real leverage on a futures position?', options: ['Using a lower day-trading margin', 'Trading a full-size contract instead of a micro', 'Keeping more cash in the account relative to notional', 'Holding the position overnight'], answer: 2, explain: 'Real leverage is notional divided by the money behind it. More cash, or smaller contracts, means lower leverage.' },
            { q: 'Ms. Ortiz holds 1 MES in a $15,000 account at 6,000. A 3% drop costs her how much?', options: ['$90', '$900', '$9,000', '$450'], answer: 1, explain: '3% of 6,000 = 180 points x $5 = $900, which is 6% of her account.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 4: Margin calls and liquidation
    // ------------------------------------------------------------------
    {
      id: 'futures-2-margin-calls',
      title: 'Margin Calls, Liquidation & Losing More Than You Put In',
      summary: 'What happens when your account drops below maintenance margin, why brokers can close you out without asking, and how gaps can leave you owing money.',
      minutes: 14,
      icon: 'warning',
      steps: [
        {
          type: 'read',
          title: "Dev's Tuesday night",
          html: `<p>Dev deposits <strong>$2,600</strong> and buys 1 MES at 6,000, planning to hold it for a few days. Using illustrative margins of <strong>$2,400 initial</strong> and <strong>$2,200 maintenance</strong>, he has $200 of cushion above initial and $400 above maintenance.</p>
<p>That $400 is only 80 points of MES (80 x $5). On Tuesday the market drops and settles at <strong>5,910</strong>, down 90 points. That is $450 removed from his account. His balance is now <strong>$2,150</strong>, below the $2,200 maintenance level.</p>
<p>Tuesday night, Dev gets a <span class="term" data-def="A demand to deposit more money because your account fell below the required margin level.">margin call</span>.</p>
<p>A 90-point drop is about 1.5%. That is not a crash. That is a slightly rough Tuesday. And it was enough to put Dev in trouble, because his cushion was tiny compared to what he controlled.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Dev did not get wrecked by a crash. He got wrecked by a normal day plus no cushion. That is how it usually goes." },
        },
        {
          type: 'read',
          title: 'What a margin call asks for',
          html: `<p>When your account falls below maintenance margin, the standard rule in futures is that you must bring it back up to the <strong>initial</strong> margin level, not just back to maintenance.</p>
<p>For Dev: initial is $2,400 and his balance is $2,150, so the call is for <strong>$250</strong>.</p>
<p>He usually has three choices:</p>
<ol>
<li><strong>Deposit</strong> the money, quickly. Deadlines are short, often by the next trading session or sooner.</li>
<li><strong>Reduce</strong> the position so the smaller requirement fits his balance.</li>
<li><strong>Close</strong> the position and take the loss.</li>
</ol>
<p>Brokers set their own rules on top of the exchange's, and many are stricter than this. The details are in the account agreement almost nobody reads. Read it.</p>`,
        },
        {
          type: 'numeric',
          question: 'Maya paper-trades 1 MES with illustrative margins of $2,400 initial and $2,200 maintenance. Her account falls to $2,050. How much must she deposit to meet the margin call?',
          answer: 350,
          tolerance: 0.01,
          unit: '$',
          explain: 'She is below maintenance, so she must restore the account to the initial level: $2,400 - $2,050 = $350.',
        },
        { type: 'widget', name: 'margin-call', props: {}, caption: 'Step through the days. Watch the account drop with each settlement until it crosses the maintenance line, and see how much it takes to get back to initial margin.' },
        {
          type: 'read',
          title: 'Auto-liquidation: no phone call required',
          html: `<p>The phrase "margin call" sounds like someone phones you and politely asks for money. For many retail futures traders, that is not how it works.</p>
<p>Many brokers run automated risk systems that watch your account in real time. If your equity drops below what they require, especially during the trading day on low day-trading margins, they can <span class="term" data-def="When a broker closes your positions on its own, usually at market prices, to stop further losses.">liquidate</span> your position immediately, at whatever the market price is, with no warning and no chance to deposit more. Some charge an extra fee for doing it.</p>
<p>This is legal and it is in the agreement you signed. The broker is protecting itself, because if your account goes negative, the broker owes the clearinghouse that money whether or not you ever pay it back.</p>
<p>Auto-liquidation often happens at the worst moment: in a fast, ugly move, at a bad fill, right before the price bounces back. That bounce does not help you once you are out.</p>`,
          sprite: { who: 'bolt', mood: 'warn', say: "Risk system logic: equity below requirement, close position, send notice. No feelings. No waiting. Plan around the machine." },
        },
        {
          type: 'truefalse',
          statement: 'A futures broker must always contact you and give you time to deposit money before closing your positions.',
          answer: false,
          explain: 'Most futures account agreements let the broker liquidate positions without notice if your account falls short of its requirements. Some brokers do this automatically in real time.',
        },
        {
          type: 'read',
          title: 'Gaps: when your stop cannot save you',
          html: `<p>A <span class="term" data-def="An order that becomes a market order once the price reaches a trigger level, used to limit losses.">stop-loss order</span> becomes a market order when its price is hit. In a normal market, that limits your loss to roughly what you planned. But a stop is not a guarantee.</p>
<p>A <span class="term" data-def="When the price jumps from one level to another with little or no trading in between.">gap</span> happens when price jumps past your stop with no trades in between. This happens:</p>
<ul>
<li>Over weekends, when the market is closed but news is not.</li>
<li>Around surprise announcements, like an emergency central bank move.</li>
<li>In thin overnight markets, when a few large orders move prices fast.</li>
</ul>
<p>If Dev's stop sits 20 points below the price and the market opens 80 points lower on Sunday night, his stop fills near the open price, around 80 points down. Four times the loss he planned for.</p>`,
        },
        {
          type: 'read',
          title: 'Yes, you can lose more than you deposited',
          html: `<p>With a stock bought in cash, the worst case is losing what you paid. With futures, your loss is limited only by how far the price moves. If it moves far enough, your account goes <span class="down">below zero</span>, and you owe your broker the difference.</p>
<p>Here is a real-world style example. Dev holds 1 ES with $26,000 in his account. The market has a day like <strong>March 16, 2020</strong>, when the S&amp;P 500 fell about 12%. At 6,000, that is 720 points, or 720 x $50 = <strong>$36,000</strong>.</p>
<p>His account: $26,000 - $36,000 = <span class="down">-$10,000</span>. That negative balance is a debt. The broker can demand payment and send it to collections.</p>
<p>Currency markets have their own famous example: on January 15, 2015, the Swiss National Bank suddenly stopped holding down the franc's value, and it jumped dramatically in minutes. Many leveraged traders ended with negative balances, and some brokers were badly damaged.</p>`,
          sprite: { who: 'hoot', mood: 'warn', say: "With a stock bought in cash, zero is the floor. With leveraged futures, there is a basement. And the basement has a bill." },
        },
        {
          type: 'numeric',
          question: 'Leo has $25,000 and holds 1 ES at 6,000. Shocking overnight news causes a 10% drop, 600 points, before his stop can fill. What is his account balance after the loss? (Negative if he owes money.)',
          answer: -5000,
          tolerance: 0.01,
          unit: '$',
          explain: '600 points x $50 = $30,000 loss. $25,000 - $30,000 = -$5,000. He now owes his broker $5,000. A 10% overnight drop is rare, but it has happened in market history.',
        },
        {
          type: 'check',
          question: 'Which is the best description of what a stop-loss order does in futures?',
          options: ['It guarantees your loss will not exceed the stop distance', 'It usually limits losses, but can fill much worse in a gap or fast market', 'It prevents margin calls entirely', 'It stops the exchange from trading against you'],
          answer: 1,
          explain: 'Stops become market orders when triggered. In a gap or very fast market, the fill can be far beyond your stop price. They are useful, not guaranteed.',
        },
        {
          type: 'order',
          prompt: 'Put this losing chain of events in order.',
          items: ['Trader opens a position with a thin cushion above margin', 'The market moves against the position', 'Account equity falls below maintenance margin', 'Margin call or automatic risk alert', 'Broker liquidates the position if the call is not met'],
          explain: 'Thin cushion, adverse move, breach of maintenance, call, then liquidation. Each step comes faster when leverage is high.',
        },
        {
          type: 'read',
          title: 'How traders avoid this',
          html: `<p>Nobody can promise you will never get a margin call, but these habits make it far less likely:</p>
<ul>
<li><strong>Keep a big cushion.</strong> Hold much more in the account than the margin requirement.</li>
<li><strong>Trade smaller.</strong> Micros exist so small accounts do not have to use full-size contracts.</li>
<li><strong>Use stops, and respect gap risk.</strong> Know that weekends, holidays and scheduled big announcements can jump past a stop.</li>
<li><strong>Never add to a loser to "average down" with borrowed cushion.</strong> That is how a bad trade becomes an account-ending one.</li>
<li><strong>Read your broker's liquidation policy.</strong> Know the exact rules before you need them.</li>
</ul>
<p>The goal is simple: be the trader who decides when to exit, not the one whose broker decides for them.</p>`,
        },
        {
          type: 'callout',
          variant: 'warn',
          title: 'Margin hikes can trigger calls too',
          html: `<p>Remember that clearinghouses raise margin requirements when markets get volatile. If the maintenance level for your contract jumps overnight, your account can fall short without the price moving against you at all. Traders running close to the minimum get hit by both at once: losses from a wild market and a higher requirement in the same week. A large cushion handles both.</p>`,
        },
        {
          type: 'cards',
          title: 'Danger words',
          cards: [
            { front: 'Margin call', back: 'A demand to bring your account back up to the required level, usually to initial margin.' },
            { front: 'Liquidation', back: 'Your broker closing your positions, often automatically, when you fall short.' },
            { front: 'Gap', back: 'A price jump with little or no trading in between, often skipping past stop orders.' },
            { front: 'Negative balance', back: 'Losses larger than your deposit. It is a debt you owe your broker.' },
          ],
        },
        {
          type: 'quiz',
          questions: [
            { q: 'When does a futures margin call usually happen?', options: ['When your account falls below the maintenance margin level', 'Whenever a position loses money', 'Every Friday', 'Only when the position expires'], answer: 0, explain: 'Falling below maintenance triggers the call. Small losses above that level just reduce your cushion.' },
            { q: 'After a margin call, to what level must you typically restore the account?', options: ['Maintenance margin', 'Zero', 'The initial margin level', 'Double the initial margin'], answer: 2, explain: 'The standard futures rule is to restore the account to initial margin, not just back to maintenance.' },
            { q: 'Why might a broker liquidate your position without warning?', options: ['To profit from your trade', 'Your account agreement allows it, and the broker is responsible to the clearinghouse for your losses', 'Because the exchange requires all losing trades be closed', 'It is illegal, so it never happens'], answer: 1, explain: 'Brokers guarantee their customers to the clearinghouse. Agreements typically let them liquidate quickly to limit that risk.' },
            { q: 'Ms. Ortiz holds 2 MES with $5,000 in the account. The market gaps down 600 points. What is her balance?', options: ['-$1,000', '$2,000', '-$6,000', '$1,000'], answer: 0, explain: '600 x $5 x 2 = $6,000 loss. $5,000 - $6,000 = -$1,000. She owes her broker $1,000.' },
            { q: 'Which habit does the most to reduce margin call risk?', options: ['Using the lowest day-trading margin available', 'Adding to losing positions to lower the average price', 'Holding positions over every weekend', 'Keeping a large cushion and trading small, such as with micros'], answer: 3, explain: 'Cushion plus smaller size means normal moves cannot push you to the edge. The other choices increase risk.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 5: Micros, position sizing, risk of ruin
    // ------------------------------------------------------------------
    {
      id: 'futures-2-sizing-risk-of-ruin',
      title: 'Micros, Position Sizing & Staying in the Game',
      summary: 'Why micro contracts exist, how to size positions by tick risk, the brutal math of drawdowns, and why daily loss limits save accounts.',
      minutes: 15,
      icon: 'shield',
      steps: [
        {
          type: 'read',
          title: 'The problem micros solved',
          html: `<p>For years, the smallest popular S&amp;P 500 futures contract was the E-mini, ES, at $50 per point. For someone with a $5,000 account, even one contract was enormous. A 20-point stop meant risking $1,000, a fifth of the account, on a single trade.</p>
<p>In <strong>May 2019</strong>, CME launched <span class="term" data-def="Futures contracts one tenth the size of the E-mini versions, designed for smaller accounts.">Micro E-mini</span> futures on the S&amp;P 500 (MES), Nasdaq-100 (MNQ), Dow (MYM) and Russell 2000 (M2K). Each is <strong>one tenth</strong> the size of its E-mini. Micro versions of other products, such as crude oil, have followed.</p>
<p>Micros did not make futures safer. They made futures <em>smaller</em>. That matters, because the right size is the single most important risk decision a trader makes.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Micros are like ordering a slice instead of the whole pizza. Same pizza. Way less regret if it is bad." },
        },
        {
          type: 'read',
          title: 'Why smaller contracts help',
          html: `<p>Micros give smaller accounts two things:</p>
<ul>
<li><strong>Precision.</strong> With ES, your choices are 1 contract ($50 per point), 2 contracts ($100), and so on. With MES, you can choose $5, $10, $15 per point, and so on. You can match your size to your actual risk instead of rounding up to something too big.</li>
<li><strong>Room to learn.</strong> Mistakes cost one tenth as much. A new trader will make mistakes. Better to pay $25 tuition than $250.</li>
</ul>
<p>The tick values tell the story: ES moves $12.50 per tick. MES moves $1.25 per tick. NQ moves $5.00 per tick. MNQ moves $0.50 per tick.</p>
<p>The catch: commissions and fees per contract do not shrink by the same amount, so they take a bigger bite out of each micro trade. Small is not free.</p>`,
        },
        {
          type: 'numeric',
          question: 'How many MES contracts equal the per-point exposure of one ES contract?',
          answer: 10,
          tolerance: 0,
          unit: '',
          explain: 'ES is $50 per point, MES is $5 per point. $50 / $5 = 10 MES.',
        },
        {
          type: 'read',
          title: 'Sizing by tick risk',
          html: `<p>Professional sizing starts from the loss you are willing to take, not from how many contracts you can afford. The steps:</p>
<ol>
<li>Decide your <strong>max risk per trade</strong>, often a small percent of the account. Many traders use around 1%.</li>
<li>Find your <strong>stop distance</strong>: where your trade idea is proven wrong.</li>
<li>Convert the stop into <strong>dollars per contract</strong>: stop distance x point value (or ticks x tick value).</li>
<li><span class="hl">Contracts = max risk / dollar risk per contract</span>, rounded <strong>down</strong>.</li>
</ol>
<p>Example: Leo has $5,000. 1% is $50. His stop is 8 points away. On MES, 8 x $5 = $40 per contract, so he can trade 1 MES ($50 / $40 = 1.25, round down to 1). On ES, 8 x $50 = $400 per contract, which is 8% of his account. ES is simply too big for this trade.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Size formula: risk dollars divided by dollars per contract. Round down. Always down. Rounding up is how plans quietly break." },
        },
        {
          type: 'numeric',
          question: 'Maya has an $8,000 practice account and risks 1% per trade. Her MNQ stop is 20 points away ($2 per point). How many MNQ contracts can she trade?',
          answer: 2,
          tolerance: 0,
          unit: '',
          explain: '1% of $8,000 = $80. Risk per MNQ = 20 x $2 = $40. $80 / $40 = 2 contracts.',
        },
        { type: 'diagram', name: 'position-sizing', caption: 'Start from the dollars you are willing to lose, divide by the risk per contract, and the position size falls out. The stop distance decides the size, not your excitement.' },
        {
          type: 'read',
          title: 'The ugly math of drawdowns',
          html: `<p>A <span class="term" data-def="A drop from an account's peak value to a later low point.">drawdown</span> is how far your account falls from its peak. Here is the part that surprises people: getting back takes a <em>bigger</em> percentage gain than the loss.</p>
<table>
<thead><tr><th>Account loss</th><th>Gain needed to get back to even</th></tr></thead>
<tbody>
<tr><td>10%</td><td>about 11%</td></tr>
<tr><td>25%</td><td>about 33%</td></tr>
<tr><td>50%</td><td>100%</td></tr>
<tr><td>75%</td><td>300%</td></tr>
<tr><td>90%</td><td>900%</td></tr>
</tbody>
</table>
<p>Lose half your account and you need to double what is left just to be back where you started. That is why survival comes before profit. Small losses are recoverable. Big ones often are not.</p>`,
        },
        {
          type: 'numeric',
          question: 'An account drops 30%. What percent gain is needed to get back to the starting value? (Round to one decimal.)',
          answer: 42.9,
          tolerance: 0.2,
          unit: '%',
          explain: 'After a 30% loss, $100 becomes $70. To get back to $100 you need $30 / $70 = about 42.9%.',
        },
        {
          type: 'read',
          title: 'Losing streaks are guaranteed',
          html: `<p><span class="term" data-def="The chance that a trader loses so much that they cannot keep trading.">Risk of ruin</span> is the chance of losing so much that you cannot continue. It depends heavily on how much you risk per trade, because losing streaks are not a possibility. They are a certainty.</p>
<p>Say a strategy wins 55% of trades. The chance of any particular 5 trades all losing is 0.45 x 0.45 x 0.45 x 0.45 x 0.45, about 1.8%. Sounds small. But over hundreds of trades, you get hundreds of chances for that streak to show up, so you should expect to see it.</p>
<p>Now compare two traders, each hit by 10 losses in a row:</p>
<ul>
<li>Risking 2% per trade: the account ends at about 82% of where it started. Painful, recoverable.</li>
<li>Risking 10% per trade: the account ends at about 35%. Needs nearly a 190% gain to recover.</li>
</ul>`,
          sprite: { who: 'hoot', mood: 'think', say: "Probability does not care about your feelings. A 1.8% event, given enough tries, becomes an appointment." },
        },
        {
          type: 'check',
          question: 'Why do traders risk a small percent of their account per trade?',
          options: ['Because small trades always win more often', 'So inevitable losing streaks do not cause damage that is hard to recover from', 'Because exchanges require it', 'To avoid paying commissions'],
          answer: 1,
          explain: 'Losing streaks will happen. Small risk per trade keeps a streak from creating a drawdown that needs a huge gain to recover.',
        },
        {
          type: 'read',
          title: 'Daily loss limits: the circuit breaker for you',
          html: `<p>Dev's worst days follow a pattern. He loses on the first trade. Annoyed, he takes a bigger second trade to "make it back." That loses too. By lunch he is trading on anger, sizing up, ignoring stops. One bad hour turns into a ruined week. Traders call that <span class="term" data-def="Trading emotionally, usually after losses, and abandoning your plan.">tilt</span>.</p>
<p>A <strong>daily loss limit</strong> is a hard rule set in advance: if I lose a set amount today, maybe 2% to 3% of the account or a fixed number of losing trades, I stop trading until tomorrow. No exceptions, no "one more."</p>
<p>Many trading platforms let you set a loss limit that automatically blocks new orders once it is hit. Using a tool like that turns a promise to yourself into an actual rule.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "The trade that ruins an account is almost never the first loss. It is the revenge trade right after it. Set the limit before you are angry." },
        },
        {
          type: 'read',
          title: 'Putting it together: a sizing routine',
          html: `<p>Here is how Leo turns all of this into a routine he runs before every trade:</p>
<ol>
<li><strong>Account check.</strong> $5,000 in the account. Max risk per trade: 1%, so $50. Max loss today: 3%, so $150. Already down $100 today? Then only one more small trade, or none.</li>
<li><strong>Stop first.</strong> He finds the price where his idea is wrong, then measures the distance in points.</li>
<li><strong>Size second.</strong> Dollars at risk divided by dollars per contract, rounded down. If the answer is zero contracts, the trade is too big for his account, even in micros. He skips it.</li>
<li><strong>Notional check.</strong> He multiplies out the total notional value and compares it to his account, so a gap does not surprise him.</li>
</ol>
<p>It takes about a minute. It is the least exciting part of trading, and it is the part that keeps him trading next month.</p>`,
        },
        {
          type: 'match',
          prompt: 'Match each tool to the problem it solves.',
          pairs: [
            { left: 'Micro contracts', right: 'Full-size contracts are too big for a small account' },
            { left: 'Sizing by tick risk', right: 'Not knowing how many contracts to trade' },
            { left: 'Daily loss limit', right: 'Revenge trading after a string of losses' },
            { left: 'Small risk per trade', right: 'Losing streaks causing deep drawdowns' },
          ],
        },
        {
          type: 'truefalse',
          statement: 'Because MES is small, it is a low-risk product that beginners cannot get hurt with.',
          answer: false,
          explain: 'One MES still controls about $30,000 at an index level of 6,000. Five or ten micros add up fast, and losses can still exceed your deposit. Micros make size flexible, not safe.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Write the plan before the trade',
          html: `<p>A one-page written plan beats good intentions: max risk per trade, max daily loss, which contracts, which hours, and what you do after hitting a limit. Many people practice for weeks in a simulated account first, where mistakes cost nothing. If you cannot follow your own rules with fake money, real money will not make it easier.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'When did CME launch Micro E-mini equity index futures?', options: ['1982', '1997', '2019', '2023'], answer: 2, explain: 'Micro E-minis launched in May 2019. 1982 was the original S&P 500 futures and 1997 the E-mini.' },
            { q: 'Leo has $10,000, risks 1%, and his stop is 5 points away on MES. How many MES can he trade?', options: ['1', '2', '10', '4'], answer: 3, explain: '1% = $100. Risk per MES = 5 x $5 = $25. $100 / $25 = 4 contracts.' },
            { q: 'An account loses 50%. What gain is needed to break even?', options: ['50%', '100%', '75%', '150%'], answer: 1, explain: '$100 to $50 needs a $50 gain on $50, which is 100%.' },
            { q: 'What is a daily loss limit?', options: ['A rule to stop trading for the day after losing a set amount', 'A limit the exchange places on price moves', 'The maximum margin a broker allows', 'A tax rule for futures'], answer: 0, explain: 'It is a personal circuit breaker, set in advance, to prevent tilt from turning a bad day into a disaster.' },
            { q: 'Why should position size be rounded down, not up?', options: ['Exchanges reject odd sizes', 'Rounding up means risking more than your planned maximum', 'Rounding down increases profits', 'It reduces commissions to zero'], answer: 1, explain: 'If the math says 1.25 contracts, trading 2 would risk well over your limit. Rounding down keeps the risk within plan.' },
          ],
        },
      ],
    },
  ],
  bossQuestions: [
    { q: 'Dev deposits $3,000 and holds 1 MES overnight (illustrative margins: $2,400 initial, $2,200 maintenance). How far can MES fall before he drops below maintenance?', options: ['80 points', '120 points', '160 points', '600 points'], answer: 2, explain: 'He has $800 above maintenance ($3,000 - $2,200). $800 / $5 per point = 160 points.' },
    { q: 'Leo buys 2 MES at 6,000. Settlements: day 1 at 5,970, day 2 at 6,015. What total variation margin has moved after day 2?', options: ['+$150 to Leo', '-$300 from Leo', '+$450 to Leo', '+$75 to Leo'], answer: 0, explain: 'Day 1: -30 x $5 x 2 = -$300. Day 2: +45 x $5 x 2 = +$450. Net +$150, the same as (6,015 - 6,000) x $5 x 2.' },
    { q: 'Which is the most accurate statement about a $500 day-trading margin on one ES?', options: ['It makes ES ten times smaller', 'It lowers the cost per point to $5', 'It means the trade can lose at most $500', 'A 10-point move against you wipes out the entire deposit'], answer: 3, explain: 'ES is $50 per point regardless of margin. 10 points x $50 = $500. Losses can go beyond the deposit.' },
    { q: 'Maya has $6,000 and wants to risk 1% on an NQ-based trade with a 15-point stop. What fits her rule?', options: ['1 NQ', '2 MNQ', '3 MNQ', '1 NQ and 1 MNQ'], answer: 1, explain: '1% = $60. One NQ risks 15 x $20 = $300, far too much. One MNQ risks 15 x $2 = $30, so 2 MNQ = $60.' },
    { q: 'Ms. Ortiz holds 1 ES in a $40,000 account at 6,000. What is her effective leverage, and what does a 5% drop cost?', options: ['About 7.5x; $15,000', 'About 13.6x; $3,000', 'About 7.5x; $1,500', 'About 1x; $15,000'], answer: 0, explain: 'Notional $300,000 / $40,000 = 7.5x. 5% of 6,000 = 300 points x $50 = $15,000, which is 37.5% of her account.' },
  ],
};
