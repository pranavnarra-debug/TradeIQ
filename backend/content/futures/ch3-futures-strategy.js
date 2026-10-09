// Unit 4: Futures. Chapter 3: Pricing, Hedging & Strategy.
export default {
  id: 'futures-ch3',
  title: 'Pricing, Hedging & Strategy',
  blurb: 'Why futures trade where they do, how real businesses hedge, what traders actually try, the truth about prop firm evaluations, and the rules and taxes that apply.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1: How futures are priced
    // ------------------------------------------------------------------
    {
      id: 'futures-3-pricing-basis',
      title: 'Why Futures Trade Where They Do',
      summary: 'Futures prices are not random guesses about the future. Learn cost of carry, the basis, and why futures and spot prices meet at expiration.',
      minutes: 14,
      icon: 'lightbulb',
      steps: [
        {
          type: 'read',
          title: 'Two prices for the same thing',
          html: `<p>Look up the S&amp;P 500 and you see one number. Look up ES futures and you see a slightly different number. Look at gold, and the price for delivery next June is higher than the price for gold today. What gives?</p>
<p>There are two kinds of price:</p>
<ul>
<li>The <span class="term" data-def="The price for buying or selling something right now, for immediate delivery. Also called the cash price.">spot price</span>: what the thing costs right now.</li>
<li>The <strong>futures price</strong>: the price agreed today for delivery on a later date.</li>
</ul>
<p>You might guess the futures price is just "where traders think the price is going." That is part of the story for some markets, but for many contracts the gap between spot and futures is mostly explained by plain math called <span class="hl">cost of carry</span>.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "A futures price is less of a crystal ball and more of a receipt: today's price plus the cost of waiting." },
        },
        {
          type: 'read',
          title: 'Cost of carry, in plain English',
          html: `<p>Imagine two ways to own gold in six months:</p>
<ol>
<li><strong>Buy gold today.</strong> You pay now, so you give up the interest that cash could have earned. You also pay to store and insure the gold.</li>
<li><strong>Buy a gold futures contract.</strong> You pay later. Meanwhile, your cash can sit earning interest, and someone else stores the gold.</li>
</ol>
<p>If the futures price were the same as spot, option 2 would be a free lunch. So futures prices adjust to include the costs of holding the real thing:</p>
<p><span class="hl">Futures price is about spot + financing cost + storage cost - any income the asset pays</span></p>
<p>That income part matters for stock indexes. Owning the actual stocks pays <strong>dividends</strong>, which a futures holder does not receive, so dividends pull the futures price down. For bonds, the interest the bond pays plays the same role.</p>`,
        },
        {
          type: 'cards',
          title: 'Carry ingredients',
          cards: [
            { front: 'Financing', back: 'Interest you give up (or pay) by owning the asset now. Pushes futures prices higher.' },
            { front: 'Storage', back: 'Warehouse, tank, or vault costs plus insurance for physical goods. Pushes futures prices higher.' },
            { front: 'Dividends or yield', back: 'Income from owning the real asset, which futures holders do not get. Pushes futures prices lower.' },
            { front: 'Convenience yield', back: 'The extra value of having the physical item on hand right now, like a refinery that needs oil today. Can push futures lower.' },
          ],
        },
        {
          type: 'read',
          title: 'Worked example: S&P 500 fair value',
          html: `<p>Use round, illustrative numbers. The S&amp;P 500 is at <strong>6,000</strong>. Short-term interest rates are <strong>4%</strong> a year. The index pays dividends of about <strong>1.3%</strong> a year. The futures contract expires in <strong>3 months</strong> (a quarter of a year).</p>
<p>Net carry rate: 4% - 1.3% = 2.7% a year.</p>
<p>For 3 months: 6,000 x 2.7% x 0.25 = <strong>40.5 points</strong>.</p>
<p>So the futures <span class="term" data-def="The theoretical futures price based on spot plus cost of carry.">fair value</span> is about 6,000 + 40.5 = <strong>6,040.50</strong>.</p>
<p>When rates are higher than the dividend yield, index futures usually trade <em>above</em> the index. As expiration gets closer, there is less time left to carry, so that gap shrinks toward zero. Real fair value calculations use exact dividends and dates, but the idea is exactly this.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Futures above spot does not mean traders are bullish. It might just mean interest rates are higher than dividends. Math, not mood." },
        },
        {
          type: 'numeric',
          question: 'An index is at 6,000. Interest rates are 5% a year and the dividend yield is 1% a year. Using simple cost of carry, what is the fair value for a futures contract expiring in 6 months?',
          answer: 6120,
          tolerance: 0.5,
          unit: '',
          explain: 'Net carry = 5% - 1% = 4% a year. For half a year: 6,000 x 4% x 0.5 = 120. Fair value is about 6,000 + 120 = 6,120.',
        },
        {
          type: 'read',
          title: 'The basis',
          html: `<p>Traders have a name for the gap between spot and futures: the <span class="term" data-def="Spot price minus futures price.">basis</span>.</p>
<p><span class="hl">Basis = spot price - futures price</span></p>
<p>In the S&amp;P example, spot 6,000 minus futures 6,040.50 gives a basis of <strong>-40.5</strong>. When futures are above spot, the basis is negative. When futures are below spot, it is positive.</p>
<p>Basis is a huge deal for hedgers. A corn farmer in Iowa does not sell corn at the Chicago futures price. She sells to a local grain elevator at a <strong>local cash price</strong>, which differs from futures because of transport costs, local supply, and quality. Farmers watch their local basis closely, because a hedge only works as well as the relationship between the local cash price and futures holds up. When that relationship shifts unexpectedly, that is called <span class="term" data-def="The risk that the spot and futures prices do not move together as expected, making a hedge imperfect.">basis risk</span>.</p>`,
        },
        {
          type: 'numeric',
          question: 'Gold spot is $4,000. The futures contract for delivery in a few months trades at $4,045. What is the basis (spot minus futures)? Enter a negative number if needed.',
          answer: -45,
          tolerance: 0.01,
          unit: '$',
          explain: 'Basis = $4,000 - $4,045 = -$45. A negative basis means the futures price is above spot, which is normal for gold because of financing and storage costs.',
        },
        { type: 'diagram', name: 'basis-convergence', caption: 'Far from expiration, futures and spot can differ by the full cost of carry. As expiration approaches, the gap narrows, and on the final day the two prices meet.' },
        {
          type: 'read',
          title: 'Convergence: they meet at the end',
          html: `<p>On the day a futures contract expires, it becomes a deal for delivery <em>right now</em>, which is exactly what spot means. So at expiration, the futures price and the spot price must come together. This is called <span class="term" data-def="Futures and spot prices moving toward each other and meeting at expiration.">convergence</span>.</p>
<p>Why must they? If they did not, traders could profit risk-free. Suppose gold futures expiring today traded $20 above spot. A trader could buy physical gold, sell the futures, and deliver the gold into the contract, pocketing $20 an ounce minus costs. Traders hunting for that free money push the prices back together.</p>
<p>This kind of trade is called <span class="term" data-def="Profiting from a price difference between related markets with little or no risk.">arbitrage</span>. Big firms do it constantly, and that is why futures prices stay tightly tied to spot plus carry, not floating wherever hype takes them.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Arbitrage rule: if two prices for the same thing drift apart, someone with fast computers will be paid to push them back." },
        },
        {
          type: 'read',
          title: 'When carry is not the whole story',
          html: `<p>Cost of carry works best for things that are easy to store and easy to borrow against, like stock indexes, Treasury notes, and gold. For other markets, the picture gets messier.</p>
<ul>
<li><strong>Crude oil and natural gas</strong> can be expensive or physically limited to store. When supply is tight right now, users will pay up for barrels today, and near-term futures can trade <em>above</em> later months. That extra value of having the stuff now is the convenience yield from the cards earlier.</li>
<li><strong>Crops</strong> follow harvest cycles. Corn for delivery just before harvest and corn for delivery right after it can be priced very differently, because a whole new crop is about to arrive.</li>
</ul>
<p>In these markets, expectations about future supply and demand matter much more. Next lesson, you will see what that does to the shape of the futures curve.</p>`,
        },
        {
          type: 'truefalse',
          statement: 'If ES futures are trading 40 points above the S&P 500 index, it must mean traders expect the market to rise 40 points.',
          answer: false,
          explain: 'Most of that gap is usually cost of carry: interest rates minus dividends over the time left. It is math, not a forecast.',
        },
        {
          type: 'check',
          question: 'Which change would push the fair value of S&P 500 futures higher, all else equal?',
          options: ['Higher dividend yields', 'Higher interest rates', 'Less time until expiration', 'Lower interest rates'],
          answer: 1,
          explain: 'Higher interest rates raise the financing part of carry, so futures fair value rises. Higher dividends and less time left both reduce it.',
        },
        {
          type: 'match',
          prompt: 'Match each term to its meaning.',
          pairs: [
            { left: 'Spot price', right: 'Price for immediate delivery' },
            { left: 'Basis', right: 'Spot minus futures' },
            { left: 'Convergence', right: 'Futures and spot meet at expiration' },
            { left: 'Arbitrage', right: 'Profiting from mismatched prices with little risk' },
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Where this shows up in real life',
          html: `<p>Before the stock market opens, news sites show "S&amp;P futures up 0.5%." Some compare futures to <strong>fair value</strong> rather than to yesterday's close, so they are showing the move beyond normal carry. If you ever see "futures above fair value" in a premarket report, now you know what it means: the futures are higher than the carry math alone would put them.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What does cost of carry describe?', options: ['The commission to trade a contract', 'The costs and income of holding the actual asset until the futures date', 'The margin required by the broker', 'The cost of shipping futures contracts'], answer: 1, explain: 'Financing, storage and insurance, minus any income like dividends, explain most of the gap between spot and futures.' },
            { q: 'How is the basis defined in this lesson?', options: ['Futures minus spot', 'Futures divided by spot', 'Initial margin minus maintenance margin', 'Spot minus futures'], answer: 3, explain: 'Basis = spot - futures. Some markets quote it the other way, so always check the convention being used.' },
            { q: 'What happens to the gap between futures and spot as expiration approaches?', options: ['It grows larger', 'It flips sign every day', 'It shrinks toward zero', 'It stays exactly constant'], answer: 2, explain: 'Less time means less carry, and at expiration the two prices converge.' },
            { q: 'Why do dividends lower the fair value of stock index futures?', options: ['Futures holders do not receive the dividends that stock owners get', 'Dividends are taxed', 'Dividends are paid to the exchange', 'Companies cut dividends when futures rise'], answer: 0, explain: 'Owning the stocks pays dividends; holding futures does not. That missing income is subtracted from the futures price.' },
            { q: 'Gold futures expiring today trade $25 above spot. What would arbitrage traders do?', options: ['Buy the futures and sell physical gold', 'Ignore it because gold is a hedge', 'Buy both', 'Buy physical gold and sell the futures, pushing the prices together'], answer: 3, explain: 'Buy the cheaper one (spot), sell the expensive one (futures), deliver, and collect the difference. That activity closes the gap.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 2: Contango and backwardation
    // ------------------------------------------------------------------
    {
      id: 'futures-3-contango-backwardation',
      title: 'Contango, Backwardation & the Day Oil Went Negative',
      summary: 'The futures curve has a shape, and that shape quietly costs or pays anyone who rolls. Plus the wild story of April 20, 2020, when a crude oil contract settled below zero.',
      minutes: 15,
      icon: 'oil',
      steps: [
        {
          type: 'read',
          title: 'The futures curve',
          html: `<p>Every futures market has many contract months trading at once. Crude oil has a contract for next month, the month after, and many months beyond that, each with its own price.</p>
<p>Line up those prices from nearest to farthest and you get the <span class="term" data-def="A line connecting the prices of the same futures product across different expiration months.">futures curve</span>. Its shape tells you a lot about a market:</p>
<ul>
<li><strong>Upward-sloping</strong> (later months cost more): <span class="term" data-def="When futures prices for later months are higher than for nearer months.">contango</span>.</li>
<li><strong>Downward-sloping</strong> (later months cost less): <span class="term" data-def="When futures prices for later months are lower than for nearer months.">backwardation</span>.</li>
</ul>
<p>Silly names, important ideas. They come from old London stock exchange slang, and nobody has been able to get rid of them since.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "Contango: the future costs more. Backwardation: the future costs less. Say them three times and you are officially a commodities nerd." },
        },
        { type: 'diagram', name: 'contango-backwardation', caption: 'In contango, the curve slopes up as months get further out. In backwardation, it slopes down. The same market can flip between the two as conditions change.' },
        {
          type: 'read',
          title: 'Why each shape happens',
          html: `<p><strong>Contango</strong> is the "normal" shape for markets where carry dominates. If storing oil, gold or grain costs money, and cash earns interest, later delivery has to cost more, or nobody would bother storing. Contango gets especially steep when there is <em>too much</em> supply right now and everyone is paying to store the extra.</p>
<p><strong>Backwardation</strong> shows up when supply is <em>tight</em> right now. Refiners, manufacturers or food companies need the product today, and they will pay more for immediate barrels than for barrels next year. Holders of physical inventory earn that convenience yield, so they are happy to sell now rather than wait.</p>
<p>A quick read: steep contango often signals a glut today. Backwardation often signals a shortage today. Neither is a guaranteed prediction of where prices will go.</p>`,
        },
        {
          type: 'check',
          question: 'Crude oil for delivery next month is $78, and for delivery in six months it is $72. What shape is this curve?',
          options: ['Contango', 'Backwardation', 'Flat', 'Convergence'],
          answer: 1,
          explain: 'Later months are cheaper than nearer months, so the curve slopes down: backwardation. It often suggests supply is tight right now.',
        },
        {
          type: 'read',
          title: 'Roll yield: the hidden cost or bonus',
          html: `<p>Anyone who holds futures for longer than one contract has to <strong>roll</strong>: sell the expiring month and buy the next. The curve shape decides whether that hurts or helps.</p>
<p><strong>In contango</strong>, a long holder sells the cheaper expiring contract and buys the more expensive next one. Then, as time passes, that new contract tends to drift down toward spot (convergence). If spot does not change, the long position loses a little every roll. This drag is called <strong>negative</strong> <span class="term" data-def="The gain or loss from rolling futures positions caused by the shape of the futures curve.">roll yield</span>.</p>
<p><strong>In backwardation</strong>, the reverse: the long sells the pricier expiring contract and buys a cheaper later one, which tends to drift <em>up</em> toward spot. That is positive roll yield.</p>
<p>The important part: a long futures holder in steep contango can lose money even if the spot price stays perfectly flat.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Contango is a slow leak. You will not notice it on day one. You will notice it after a year of 'why is my oil fund down when oil is flat?'" },
        },
        {
          type: 'numeric',
          question: 'A fund holds long crude futures. It sells the expiring contract at $70 and buys the next month at $72. Spot oil stays at $70, and the new contract drifts down to $70 by its expiration. How much did the fund lose per barrel on that roll?',
          answer: 2,
          tolerance: 0.01,
          unit: '$',
          explain: 'It bought at $72 and the contract converged to $70: a $2 loss per barrel, even though spot never moved. That is negative roll yield from contango.',
        },
        {
          type: 'read',
          title: 'Why commodity funds can lag spot',
          html: `<p>Most people cannot store oil, so commodity exchange-traded funds and similar products hold <strong>futures</strong> instead and roll them over and over. In markets that sit in contango for long stretches, the roll drag adds up.</p>
<p>That is why a fund tracking oil futures can trail the spot oil price you see on the news, sometimes by a lot over a year or more. Products based on VIX futures have also tended to lose value over long calm stretches, partly because VIX futures are often in contango.</p>
<p>None of this is hidden. It is in the fund's prospectus. But many buyers assume "oil fund" means "owns oil" and are surprised when it does not track the headline price. Before buying any commodity fund, check what it actually holds, which contract months, and how it rolls.</p>`,
        },
        {
          type: 'truefalse',
          statement: 'A fund that holds and rolls long crude oil futures will always match the change in the spot price of oil.',
          answer: false,
          explain: 'Roll yield, fees and the choice of contract months mean futures-based funds can drift far from spot, especially in long periods of contango.',
        },
        {
          type: 'read',
          title: 'April 20, 2020: oil below zero',
          html: `<p>In spring 2020, the pandemic shut down travel worldwide. Demand for oil collapsed, but oil kept flowing out of the ground. Storage tanks filled up, including at <strong>Cushing, Oklahoma</strong>, the delivery hub for WTI crude futures (CL).</p>
<p>The May 2020 CL contract was about to expire. Anyone still long would have to take delivery of 1,000 barrels per contract at Cushing. Many long holders, including funds and traders who never intended to take delivery, had nowhere to put the oil. So they had to sell, at almost any price.</p>
<p>On <strong>April 20, 2020</strong>, the May contract settled at about <span class="down">-$37.63</span> per barrel. Sellers were effectively <em>paying</em> buyers to take oil off their hands. Meanwhile, the June contract was still trading at roughly $20, because there was time for storage to free up.</p>
<p>It was the first time a WTI futures contract had ever settled below zero.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: "Negative $37. As in: here is a barrel of oil and also some money, please take it. Markets can get very weird very fast." },
        },
        {
          type: 'read',
          title: 'What that day teaches',
          html: `<p>The negative oil day packs this whole unit into one story:</p>
<ul>
<li><strong>Physical delivery is real.</strong> A CL contract is a promise about real barrels in a real place. When storage ran out, that promise became a liability.</li>
<li><strong>Extreme contango.</strong> The gap between May and June showed what a glut does to the curve.</li>
<li><strong>Prices can go where you thought they could not.</strong> Many trading systems and many traders assumed oil could never go below zero. It did.</li>
<li><strong>Leverage plus a surprise.</strong> Some retail traders who bought the May contract near expiration, thinking oil was "cheap," lost far more than they had deposited.</li>
</ul>
<p>The takeaway is not "never trade oil." It is: know exactly what your contract is, how it settles, and when it expires, and close or roll long before the end.</p>`,
        },
        {
          type: 'callout',
          variant: 'fact',
          title: 'The rules changed afterward, too',
          html: `<p>After that day, the fund industry and brokers adjusted. Some oil funds shifted their holdings away from the front month and spread them across later contract months to reduce the risk of being forced sellers right before expiration. Some brokers restricted retail traders from opening positions in contracts close to expiration. The lesson stuck: the last days of a physically delivered contract belong to people who can actually handle the goods.</p>`,
        },
        {
          type: 'match',
          prompt: 'Match each situation to the curve shape it most likely creates.',
          pairs: [
            { left: 'Storage tanks overflowing with unwanted supply', right: 'Steep contango' },
            { left: 'Refiners scrambling for barrels this month', right: 'Backwardation' },
            { left: 'Normal storage and financing costs for gold', right: 'Mild contango' },
          ],
        },
        {
          type: 'cards',
          title: 'Curve words',
          cards: [
            { front: 'Futures curve', back: 'Prices of one futures product across expiration months, lined up from nearest to farthest.' },
            { front: 'Contango', back: 'Later months priced higher than nearer months.' },
            { front: 'Backwardation', back: 'Later months priced lower than nearer months.' },
            { front: 'Roll yield', back: 'The gain or loss from rolling contracts that comes from the curve shape, separate from spot price changes.' },
          ],
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What is contango?', options: ['When later futures months trade above nearer months', 'When later months trade below nearer months', 'When futures equal spot', 'When a contract settles negative'], answer: 0, explain: 'Contango is an upward-sloping curve. It is common when carry costs dominate or supply is plentiful.' },
            { q: 'Why can a long futures fund lose money in contango even if spot is flat?', options: ['The exchange charges a contango fee', 'Futures always fall in price', 'Each roll buys a pricier contract that tends to converge down toward spot', 'Funds must short in contango'], answer: 2, explain: 'Selling cheap and buying expensive at each roll, then watching the new contract drift down, creates negative roll yield.' },
            { q: 'On April 20, 2020, the May WTI crude contract settled at about...', options: ['$0.01', '-$3.76', '$20.00', '-$37.63'], answer: 3, explain: 'It settled at about -$37.63 per barrel as holders without storage rushed to exit before expiration.' },
            { q: 'What was the key reason the May 2020 oil contract went negative?', options: ['A computer glitch at the exchange', 'Storage was running out, so longs facing delivery had to sell at almost any price', 'OPEC banned oil exports', 'The contract was cash-settled'], answer: 1, explain: 'CL is physically delivered at Cushing. With storage nearly full and expiration near, longs had to dump contracts.' },
            { q: 'Backwardation most often signals...', options: ['Tight supply right now', 'A storage glut', 'Rising interest rates', 'Nothing at all'], answer: 0, explain: 'When the product is scarce now, buyers pay more for near delivery, pulling the front of the curve above later months.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 3: Hedging in practice
    // ------------------------------------------------------------------
    {
      id: 'futures-3-hedging-in-practice',
      title: 'Hedging in Real Life',
      summary: 'Airlines, corn farmers, Ms. Ortiz, and stock portfolios. See how real hedges are built, what they cost, and why a good hedge can still "lose money."',
      minutes: 15,
      icon: 'shield',
      steps: [
        {
          type: 'read',
          title: 'The point of a hedge',
          html: `<p>A hedge is not a bet. It is a trade designed to <strong>move opposite</strong> to a risk you already have, so that when one side hurts, the other side helps.</p>
<p>The goal is not to make money on the futures. The goal is to make your overall result more <span class="hl">predictable</span>. A perfect hedge makes your outcome almost the same whether prices go up, down or sideways.</p>
<p>That predictability has a price: you give up the lucky upside. A farmer who hedges does not get rich when prices spike. An airline that hedges does not save a fortune when fuel collapses. They both sleep better, and they both can plan.</p>
<p>Let us look at how real hedgers do it, with real-sized numbers.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: "Hedging is the grown-up move: trade away the jackpot so a disaster cannot wipe you out. Very piggy-bank energy. I approve." },
        },
        {
          type: 'read',
          title: 'The corn farmer: a short hedge',
          html: `<p>A farmer expects to harvest <strong>50,000 bushels</strong> of corn this fall. In spring, December corn futures (ZC) trade at <strong>$4.50</strong>. Her local elevator usually pays about 30 cents under futures, a local basis of -$0.30.</p>
<p>Worried about a price drop, she <strong>sells 10 ZC contracts</strong> (10 x 5,000 = 50,000 bushels). That is a <span class="term" data-def="Selling futures to protect against a fall in the price of something you own or will produce.">short hedge</span>.</p>
<p>By harvest, futures fall to <strong>$3.80</strong> and her local price falls to $3.50.</p>
<ul>
<li>Futures gain: $0.70 x 50,000 = <span class="up">+$35,000</span></li>
<li>Corn sold locally: $3.50 x 50,000 = $175,000</li>
<li>Total: <strong>$210,000</strong>, or $4.20 per bushel</li>
</ul>
<p>$4.20 is exactly the $4.50 futures price plus her expected -$0.30 basis. She locked it in. If prices had <em>risen</em> to $5.20 instead, her futures would have lost $35,000, but she would have sold her corn for $4.90, and still ended at about $4.20.</p>`,
        },
        {
          type: 'numeric',
          question: 'A soybean farmer expects 25,000 bushels. Soybean futures are 5,000 bushels per contract. How many contracts should he sell to fully hedge?',
          answer: 5,
          tolerance: 0,
          unit: '',
          explain: '25,000 / 5,000 = 5 contracts. Many farmers hedge only part of their expected crop, because the harvest size itself is uncertain.',
        },
        {
          type: 'read',
          title: 'The airline: a long hedge with a twist',
          html: `<p>Fuel is one of an airline's biggest costs. To protect against rising prices, airlines use a <span class="term" data-def="Buying futures to protect against a rise in the price of something you will need to buy.">long hedge</span>: buying energy futures or similar contracts.</p>
<p>The twist: jet fuel futures are not very actively traded, so airlines often hedge with related, more liquid markets like crude oil or heating oil (diesel), or with private swap contracts. This is a <strong>cross-hedge</strong>. It works because these prices tend to move together, but not perfectly, so there is extra basis risk.</p>
<p>Southwest Airlines became famous for its fuel hedging in the 2000s, which was widely credited with saving it a lot of money as oil prices surged. But when oil prices crashed in late 2008, airlines holding hedges booked large hedging losses, because they had locked in higher prices just before fuel got cheap.</p>
<p>Both results are what a hedge is supposed to do. The hedge did not "fail" in 2008. It traded upside for predictability, and that year the upside was big.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "A hedge is judged by the combined result, not by the futures leg alone. Insurance that pays nothing in a good year did its job." },
        },
        {
          type: 'check',
          question: 'Why might an airline hedge jet fuel using heating oil or crude futures?',
          options: ['Jet fuel cannot legally be hedged', 'Those markets are more liquid, and their prices tend to move with jet fuel', 'Heating oil is always cheaper', 'Exchanges require it'],
          answer: 1,
          explain: 'Liquidity matters. Using a related, liquid market works reasonably well, but the imperfect link adds basis risk.',
        },
        {
          type: 'read',
          title: "Ms. Ortiz and the reality of size",
          html: `<p>Back to Ms. Ortiz. In Chapter 1, she hedged wheat with futures. Here is the honest catch: one CBOT wheat contract is <strong>5,000 bushels</strong>, which makes a <em>lot</em> of flour, likely more than a single small bakery uses in a long time. Contract size can make futures a poor fit for small businesses.</p>
<p>So in real life, a small bakery is more likely to "hedge" by signing a <strong>fixed-price contract with its flour supplier</strong> for the next several months. The supplier, which buys huge amounts of wheat, may then hedge <em>its</em> risk with futures. Risk flows up the chain to whoever is big enough to use the exchange efficiently.</p>
<p>A larger bakery chain might hedge directly. Even then, it only needs to hedge the share of its flour costs tied to wheat prices, not its whole budget.</p>`,
        },
        {
          type: 'read',
          title: 'Hedging a stock portfolio',
          html: `<p>Futures can also protect a stock portfolio without selling any stock. If you own stocks and short index futures, losses in the stocks are partly offset by gains on the short futures.</p>
<p>The basic <span class="term" data-def="The number of futures contracts needed to offset a given exposure.">hedge ratio</span> math:</p>
<p><span class="hl">Contracts = (portfolio value x beta) / notional value of one contract</span></p>
<p><span class="term" data-def="A measure of how much a portfolio tends to move compared to the overall market. 1.0 means it moves about the same.">Beta</span> adjusts for how jumpy your portfolio is compared to the S&amp;P 500. A portfolio with beta 1.2 tends to move about 20% more than the index.</p>
<p>Example: a $250,000 portfolio with beta 1.2 behaves like $300,000 of S&amp;P 500 exposure. At an index level of 6,000, one ES is $300,000 notional. So <strong>shorting 1 ES</strong> (or 10 MES) roughly hedges it. Beta is an estimate from the past, so the hedge is approximate, not perfect.</p>`,
        },
        {
          type: 'numeric',
          question: "Ms. Ortiz's retirement account holds $90,000 of stocks that move about like the S&P 500 (beta 1.0). At an index level of 6,000, how many MES contracts ($5 x index) would roughly hedge it?",
          answer: 3,
          tolerance: 0,
          unit: '',
          explain: 'One MES = 6,000 x $5 = $30,000 notional. $90,000 x 1.0 / $30,000 = 3 MES short.',
        },
        {
          type: 'read',
          title: 'What hedging costs',
          html: `<p>Hedges are useful, but never free:</p>
<ul>
<li><strong>Lost upside.</strong> If the market rallies, the short futures lose and offset your stock gains.</li>
<li><strong>Margin and cash flow.</strong> The futures leg is marked to market daily. If stocks rally, you must cover futures losses in cash right away, even though your stock gains are just sitting there on paper.</li>
<li><strong>Imperfect matching.</strong> Basis risk, beta estimates, and contract sizes that do not divide evenly all leave gaps.</li>
<li><strong>Rolling.</strong> Long hedges need rolling every quarter, with transaction costs each time.</li>
<li><strong>Taxes and complexity.</strong> The futures leg can be taxed differently from the stocks.</li>
</ul>
<p>For many long-term investors, the simpler "hedge" is just holding an amount of stock they can tolerate through a crash. Futures hedging makes the most sense for big, specific, short-term risks.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A hedge that blows up your cash with margin calls is not a hedge. It is a second problem. Plan the cash before the trade." },
        },
        {
          type: 'callout',
          variant: 'example',
          title: 'Partial hedges are normal',
          html: `<p>Hedgers rarely cover 100% of their exposure. The corn farmer does not know her exact harvest until it is in, so she might hedge half or two thirds of her expected crop. If a drought cuts her harvest and she had hedged all of it, she would be short futures on corn she does not have, which turns her hedge into a speculation. Investors do the same: Ms. Ortiz might short 1 or 2 MES against her $90,000 instead of 3, trimming her risk rather than erasing it.</p>`,
        },
        {
          type: 'truefalse',
          statement: 'A farmer who hedges 100% of an expected crop with futures is fully protected even if a drought cuts the harvest in half.',
          answer: false,
          explain: 'If the harvest is smaller than the hedge, part of the futures position is no longer offset by any real corn. That part is now a speculative short. This quantity risk is why many farmers hedge only part of their expected crop.',
        },
        {
          type: 'cards',
          title: 'Hedging words',
          cards: [
            { front: 'Short hedge', back: 'Selling futures to protect something you own or will sell from a price drop.' },
            { front: 'Long hedge', back: 'Buying futures to protect against a rise in the price of something you will buy.' },
            { front: 'Cross-hedge', back: 'Hedging with a related market because no good contract exists for the exact item.' },
            { front: 'Hedge ratio', back: 'How many contracts to use: exposure adjusted for beta, divided by one contract\'s notional value.' },
          ],
        },
        {
          type: 'match',
          prompt: 'Match each hedger to the right futures position.',
          pairs: [
            { left: 'Corn farmer worried prices will fall', right: 'Short corn futures' },
            { left: 'Airline worried fuel will rise', right: 'Long energy futures' },
            { left: 'Investor worried stocks will drop', right: 'Short index futures' },
            { left: 'Cereal maker worried grain will rise', right: 'Long grain futures' },
          ],
        },
        {
          type: 'quiz',
          questions: [
            { q: 'A wheat farmer sells futures before harvest. What kind of hedge is that?', options: ['A long hedge', 'A short hedge', 'A cross-hedge', 'A calendar spread'], answer: 1, explain: 'Selling futures protects against falling prices for something you will sell. That is a short hedge.' },
            { q: 'In the corn example, why did the farmer end at about $4.20 whether prices rose or fell?', options: ['The exchange guaranteed it', 'She sold her corn early', 'Futures gains or losses offset changes in her local cash price', 'Corn prices did not move'], answer: 2, explain: 'The futures leg moved opposite her cash sale, locking in roughly the futures price plus her expected basis.' },
            { q: 'A $600,000 portfolio has beta 1.0. With ES at 6,000 ($300,000 notional), how many ES roughly hedge it?', options: ['2', '1', '6', '20'], answer: 0, explain: '$600,000 x 1.0 / $300,000 = 2 ES short.' },
            { q: 'What is a real cost of hedging a stock portfolio with short futures?', options: ['Futures cannot be shorted', 'Your stocks are sold automatically', 'Hedging is illegal for individuals', 'If stocks rally, you owe daily cash on the futures leg and give up upside'], answer: 3, explain: 'The short futures lose in a rally and are marked to market daily, so you need cash, and your net gain is muted.' },
            { q: 'An airline lost money on its fuel hedges in a year when oil prices crashed. What is the best description?', options: ['The hedge did its job: fuel got cheaper, offsetting the hedge loss', 'The airline speculated and lost', 'Hedges only work when they make money', 'The exchange cancelled the hedge'], answer: 0, explain: 'A hedge trades away the upside for predictability. Cheaper fuel offset the hedge loss.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 4: Spreads and trend following
    // ------------------------------------------------------------------
    {
      id: 'futures-3-spreads-trends',
      title: 'Spreads, Trends & Trading the Open',
      summary: 'What futures traders actually try: calendar and inter-commodity spreads, systematic trend following, and session-based day trading. How each works and why none is guaranteed.',
      minutes: 15,
      icon: 'chart',
      steps: [
        {
          type: 'read',
          title: 'Not every trade is "up or down"',
          html: `<p>Most beginners think of trading as one question: will the price go up or down? Futures traders have more options. Some of the oldest strategies in the futures world do not care much about direction at all. They trade <strong>relationships</strong> between prices.</p>
<p>In this lesson you will see three families of strategy:</p>
<ol>
<li><strong>Spreads:</strong> trading the gap between two related contracts.</li>
<li><strong>Trend following:</strong> systematically riding big moves across many markets.</li>
<li><strong>Session-based day trading:</strong> trading specific times and levels, especially around the New York open.</li>
</ol>
<p>Read this as a field guide, not a menu. Every one of these can lose money, and the people doing them professionally have tools and experience you do not have yet.</p>`,
          sprite: { who: 'chip', mood: 'think', say: "Field guide, not a recipe book. Knowing how the strategies work is how you spot when someone online is overselling one." },
        },
        {
          type: 'read',
          title: 'Calendar spreads',
          html: `<p>A <span class="term" data-def="Buying one month of a futures contract and selling a different month of the same product at the same time.">calendar spread</span> means going long one contract month and short another month of the same product. Your profit depends on the <strong>difference</strong> between the two prices, not on the overall price level.</p>
<p>Example: Leo thinks the crude oil market is getting tighter, so near-term barrels will gain value <em>relative to</em> later ones. He buys December crude and sells January crude. If both rise or both fall by the same amount, he roughly breaks even. He profits only if December gains on January.</p>
<p>Because the two legs offset much of each other's risk, exchanges often charge <strong>lower margin</strong> for spreads than for a single outright position. But "lower risk" is not "no risk." In physical markets near expiration, spreads can move violently. The May-June crude spread in April 2020 is the extreme example.</p>`,
        },
        {
          type: 'numeric',
          question: 'Leo buys December CL at $70.00 and sells January CL at $70.50. Later, December is $71.20 and January is $71.30. What is his net profit on the spread (1,000 barrels per contract)?',
          answer: 400,
          tolerance: 0.01,
          unit: '$',
          explain: 'December leg: +$1.20 x 1,000 = +$1,200. January leg (short): -$0.80 x 1,000 = -$800. Net +$400. Shortcut: the spread went from -$0.50 to -$0.10, a $0.40 gain, x 1,000 = $400.',
        },
        {
          type: 'read',
          title: 'Inter-commodity spreads',
          html: `<p>An <span class="term" data-def="A trade going long one product and short a different but related product.">inter-commodity spread</span> pairs two different but related markets. Some classics:</p>
<ul>
<li><strong>Crack spread:</strong> crude oil vs gasoline and heating oil. It approximates a refiner's profit margin, since refiners "crack" crude into fuels. Refiners hedge it; traders speculate on it.</li>
<li><strong>Soybean crush:</strong> soybeans vs soybean meal and soybean oil, the products you get by crushing beans.</li>
<li><strong>Gold vs silver:</strong> traders watch the ratio between the two metals' prices.</li>
<li><strong>NQ vs ES:</strong> tech-heavy Nasdaq-100 vs the broad S&amp;P 500, a bet on tech outperforming or underperforming the wider market.</li>
</ul>
<p>Spreads must be sized carefully because the contracts differ. One NQ and one ES are not equal exposure: at example levels, one NQ controls more notional than one ES, and Nasdaq tends to swing more. Spread traders balance the dollar exposure on each side.</p>`,
        },
        {
          type: 'match',
          prompt: 'Match each spread to what it trades.',
          pairs: [
            { left: 'Calendar spread', right: 'Two months of the same product' },
            { left: 'Crack spread', right: 'Crude oil vs refined fuels' },
            { left: 'Soybean crush', right: 'Soybeans vs meal and oil' },
            { left: 'NQ vs ES', right: 'Tech-heavy index vs broad index' },
          ],
        },
        {
          type: 'read',
          title: 'Trend following',
          html: `<p>Many professional futures funds are run by <span class="term" data-def="Commodity Trading Advisor: a person or firm paid to give advice on or manage futures trading, generally required to register with the CFTC and be an NFA member.">CTAs</span>, commodity trading advisors. A large share of them follow a simple-sounding philosophy: <strong>trend following</strong>.</p>
<p>The idea: prices sometimes move in long, persistent trends. A trend follower does not try to predict them. Instead, rules like "buy when price breaks above its 100-day high" or "be long when the 50-day average is above the 200-day" get them in after a trend starts. Then:</p>
<ul>
<li>Cut losing trades quickly.</li>
<li>Let winning trades run as long as the trend lasts.</li>
<li>Spread risk across many markets: stocks, bonds, currencies, energy, metals, grains.</li>
</ul>
<p>Trend followers are often wrong more than half the time. They rely on a few big winners to pay for many small losers.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Trend following in one line: small losses, often. Big wins, rarely. Survival depends on the big wins actually showing up." },
        },
        {
          type: 'numeric',
          question: 'A trend system wins 40% of trades with an average win of $500 and loses 60% of trades with an average loss of $200. What is its average result per trade (expectancy)?',
          answer: 80,
          tolerance: 0.01,
          unit: '$',
          explain: '0.40 x $500 = $200. 0.60 x $200 = $120. $200 - $120 = $80 per trade on average, before costs. A low win rate can still work if wins are much bigger than losses.',
        },
        {
          type: 'read',
          title: 'The catch with trends',
          html: `<p>Trend following as a group has had strong years when big trends appeared across markets, such as 2008 and 2022. It has also had long, frustrating stretches when markets chopped sideways and every breakout reversed. Those choppy periods are called <strong>whipsaws</strong>, and they can produce loss after small loss for months or years.</p>
<p>That is the hard part. The rules are simple. Sticking with them through a long losing stretch, when everyone says the strategy is dead, is not. And past strong years are no promise of future ones.</p>`,
        },
        {
          type: 'read',
          title: 'Session-based day trading',
          html: `<p>Many retail futures traders focus on a short window, usually the first hour or two of the New York session. They watch a few reference levels:</p>
<ul>
<li>The <strong>overnight high and low</strong> from the Globex session.</li>
<li>The <strong>prior day's high, low and settlement</strong>.</li>
<li>The <strong>opening range</strong>: the high and low of the first 15 or 30 minutes after 9:30am ET.</li>
<li><strong>VWAP</strong>, the volume-weighted average price for the session.</li>
</ul>
<p>A common idea is the "opening range breakout": if price breaks above the opening range, buy; below, sell; with a stop on the other side. Others fade moves back toward VWAP.</p>
<p>These levels are useful for organizing what you see. But they are widely known, which means lots of traders, including professional algorithms, are watching the exact same lines. There is no secret level that works every time.</p>`,
        },
        {
          type: 'read',
          title: 'The hard truth about day trading',
          html: `<p>Research on retail day traders has not been kind. One widely cited study of people who day-traded Brazilian stock index futures found that the vast majority of those who kept at it for more than 300 days lost money, and only a tiny fraction earned more than a minimum wage.</p>
<p>Why is it so hard? Costs (spreads, commissions, slippage) hit every trade. You are competing with fast, well-funded professionals. And short-term price moves contain a lot of randomness, so it is easy to mistake luck for skill over a few weeks.</p>
<p>None of that means no one succeeds. It means the default outcome is losing, and the burden of proof is on any strategy, especially one sold to you in a video.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "If a strategy were simple, guaranteed and free, the people selling it would be using it instead of selling it. Think about why they are not." },
        },
        {
          type: 'cards',
          title: 'Strategy words',
          cards: [
            { front: 'Spread trade', back: 'Long one contract and short a related one, betting on the gap between them.' },
            { front: 'CTA', back: 'Commodity trading advisor, a registered manager or adviser for futures trading.' },
            { front: 'Whipsaw', back: 'A choppy market where breakouts keep reversing, causing repeated small losses.' },
            { front: 'Expectancy', back: 'Average profit or loss per trade: win rate x average win minus loss rate x average loss.' },
            { front: 'VWAP', back: 'Volume-weighted average price for the session, a common intraday reference level.' },
          ],
        },
        {
          type: 'truefalse',
          statement: 'If a strategy made money in a backtest over the last two years, it will very likely make money going forward.',
          answer: false,
          explain: 'Backtests can be overfitted, meaning tuned to past noise. They often ignore real costs and slippage. Markets also change. A good backtest is a starting point for testing, not a promise.',
        },
        {
          type: 'order',
          prompt: 'Put these steps for testing a trading idea in a sensible order.',
          items: ['Write the idea as exact rules for entry, exit and size', 'Backtest on past data including realistic costs', 'Trade it in a simulator for weeks', 'If it still holds up, trade it live at the smallest size', 'Review results and keep a journal'],
          explain: 'Rules first, then historical test with costs, then simulated trading, then tiny real size. Each step filters out ideas that only looked good on paper.',
        },
        {
          type: 'quiz',
          questions: [
            { q: 'What does a calendar spread trade?', options: ['The price difference between two months of the same product', 'Two unrelated stocks', 'The same contract on two exchanges', 'A stock and its option'], answer: 0, explain: 'Long one month, short another month of the same product. Profit depends on the gap between them.' },
            { q: 'Why do exchanges often charge lower margin for spreads?', options: ['Spreads cannot lose money', 'The two legs offset much of each other\'s risk', 'Spreads are only for hedgers', 'The exchange earns more fees on spreads'], answer: 1, explain: 'Related legs tend to move together, so the combined position usually swings less than one outright contract. Usually, not always.' },
            { q: 'Which description best fits trend following?', options: ['Buy dips and sell rips', 'Win most trades with small profits', 'Many small losses, a few large wins, across many markets', 'Only trade the first five minutes of the day'], answer: 2, explain: 'Trend followers often lose more often than they win but aim for wins much larger than losses.' },
            { q: 'A system wins 30% of the time, average win $600, average loss $300. What is its expectancy per trade before costs?', options: ['+$90', '+$180', '-$30', '-$90'], answer: 2, explain: '0.30 x $600 = $180. 0.70 x $300 = $210. $180 - $210 = -$30. It loses money on average even though wins are twice the size of losses.' },
            { q: 'What is the "opening range"?', options: ['The prior day\'s settlement price', 'The high and low of the first minutes after the 9:30am ET open', 'The overnight Asia session', 'The daily price limit'], answer: 1, explain: 'It is the high and low of the first 15 or 30 minutes of the regular session, a common reference level for day traders.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 5: Prop firms and evaluations
    // ------------------------------------------------------------------
    {
      id: 'futures-3-prop-firms',
      title: 'Prop Firm Evaluations: Read the Fine Print',
      summary: 'Funded-trader programs promise you can trade big accounts for a small fee. Learn how evaluations, profit targets and trailing drawdowns work, and why most participants never get paid.',
      minutes: 14,
      icon: 'briefcase',
      steps: [
        {
          type: 'read',
          title: 'The pitch',
          html: `<p>Scroll trading videos for five minutes and you will see the ads: "Trade our $50,000 account. Keep up to 90% of the profits. No risk of losing your own money."</p>
<p>These are <strong>funded-trader evaluation programs</strong>, usually run by companies that call themselves prop firms. They became hugely popular with retail futures traders in the 2020s, especially for ES, NQ and their micros.</p>
<p>The appeal is real. Instead of risking $50,000 of your own money, you pay a fee to prove you can follow their rules. If you pass, you trade their account and get a share of the profits.</p>
<p>The structure behind that pitch is worth understanding in detail before anyone spends a dollar on it, because the details are where most people get stuck.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: "Trade a $50,000 account for a small fee sounds amazing. Let us find out what the word 'evaluation' is doing in that sentence." },
        },
        {
          type: 'read',
          title: 'How a typical evaluation works',
          html: `<p>Details differ a lot by firm, but most follow this shape. The numbers below are <strong>illustrative only</strong>:</p>
<table>
<thead><tr><th>Rule</th><th>Example for a "$50,000" account</th></tr></thead>
<tbody>
<tr><td>Evaluation fee</td><td>A monthly or one-time fee, often tens to a couple hundred dollars</td></tr>
<tr><td>Profit target</td><td>Make $3,000</td></tr>
<tr><td>Max drawdown</td><td>$2,000, often trailing</td></tr>
<tr><td>Daily loss limit</td><td>Some firms: around $1,000</td></tr>
<tr><td>Position limit</td><td>A cap, like 5 ES or 50 MES</td></tr>
<tr><td>Other rules</td><td>Minimum trading days, consistency rules, news restrictions</td></tr>
</tbody>
</table>
<p>Hit the target without breaking any rule and you "pass." Break one rule, even once, and you fail and usually must pay again or pay a reset fee. After passing, many firms charge an <strong>activation fee</strong> for the funded stage, and payouts come with their own rules: buffers, caps, minimum days and profit splits.</p>`,
        },
        {
          type: 'cards',
          title: 'Prop firm vocabulary',
          cards: [
            { front: 'Evaluation', back: 'A paid test, usually on a simulated account, where you must hit a profit target without breaking rules.' },
            { front: 'Profit target', back: 'The amount you must gain to pass the evaluation.' },
            { front: 'Trailing drawdown', back: 'A max loss limit that rises as your account hits new highs, but never moves back down.' },
            { front: 'Consistency rule', back: 'A rule that no single day can make up too large a share of your total profit.' },
            { front: 'Reset fee', back: 'What you pay to restart an evaluation after breaking a rule.' },
            { front: 'Profit split', back: 'The share of profits paid to you, with the rest kept by the firm.' },
          ],
        },
        {
          type: 'read',
          title: 'The trailing drawdown trap',
          html: `<p>The rule that ends the most evaluations is usually the <strong>trailing drawdown</strong>. Here is how a typical version works:</p>
<ul>
<li>You start at $50,000 with a $2,000 trailing drawdown, so your failure line is <strong>$48,000</strong>.</li>
<li>Your balance climbs to a new high of $51,500. The failure line trails up to <strong>$49,500</strong>.</li>
<li>Now the market turns. You give back $2,000 and your balance is $49,500. You fail, even though you are only $500 below where you started.</li>
</ul>
<p>The line only moves <em>up</em>. Every new high shrinks your room for error. Some firms track the high using <strong>end-of-day</strong> balances; others use <strong>intraday</strong> peaks, including profits you had on screen but never locked in. Many stop trailing once the line reaches the starting balance. These differences are huge, and they are in the fine print.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A trailing drawdown chases your best moment and never forgets it. One great morning, one bad afternoon, and you are out." },
        },
        {
          type: 'numeric',
          question: "Maya's practice evaluation starts at $50,000 with a $2,000 trailing drawdown based on end-of-day highs. Her best end-of-day balance so far is $51,200. Where is her failure line now?",
          answer: 49200,
          tolerance: 0.01,
          unit: '$',
          explain: 'The failure line trails $2,000 below the highest end-of-day balance: $51,200 - $2,000 = $49,200. It will not move back down even if her balance falls.',
        },
        {
          type: 'check',
          question: "Dev's firm uses an intraday trailing drawdown of $2,000. He is up $1,500 in an open trade, does not close it, and the trade comes back to breakeven. How much room does he now have before failing?",
          options: ['$2,000, because he did not lose any money', '$3,500', '$500, because the line trailed up with his open profit', 'Zero, he already failed'],
          answer: 2,
          explain: 'With intraday trailing, the unrealized peak counts. The line moved up $1,500, so he has only $500 of room left even though his balance is back where he started.',
        },
        {
          type: 'read',
          title: 'Who actually makes the money?',
          html: `<p>Think about the business model. A firm collects evaluation fees, reset fees and activation fees from every participant. It pays out only to the subset who pass <em>and</em> then meet the payout rules.</p>
<p>Many firms' "funded" accounts are also <strong>simulated</strong>. Your trades may never reach the real market; the firm pays your share out of its own revenue. That is not automatically a scam, but it means your payout depends on the firm's finances and its rules, not on a real brokerage account in your name.</p>
<p>Most participants never pass, and of those who do, fewer still ever receive a payout. When firms have released any numbers, they have generally supported that picture. If a firm's ads show only winners, remember who is not in the ad.</p>`,
        },
        {
          type: 'truefalse',
          statement: 'Passing a prop firm evaluation always means you are now trading the firm\'s real money in the live market.',
          answer: false,
          explain: 'Many firms keep funded accounts in simulation and pay traders from company funds based on simulated results. Read exactly what "funded" means at each firm.',
        },
        {
          type: 'read',
          title: 'Not regulated like a broker',
          html: `<p>A futures broker, called a futures commission merchant (FCM), is registered with the CFTC, is a member of the NFA, and must keep customer money in segregated accounts. Prop firm evaluations generally are <strong>not</strong> regulated that way. Your fee is a purchase, not a customer deposit.</p>
<p>That has real consequences. Over the past few years, some prop firms have abruptly changed rules, delayed or denied payouts, shut down, or faced regulatory action, leaving traders unpaid. Customer protections that apply to brokerage accounts may not apply at all.</p>
<p>Before paying any firm, look for: how long it has operated, the full written rules, the payout policy, how it handles disputes, and what independent traders report about actually getting paid.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Checklist: drawdown type, daily limit, consistency rule, news rules, payout rules, fees, age of firm. If any are unclear, do not pay yet." },
        },
        {
          type: 'match',
          prompt: 'Match each rule to what it means.',
          pairs: [
            { left: 'End-of-day trailing drawdown', right: 'Line moves up based on closing balances only' },
            { left: 'Intraday trailing drawdown', right: 'Line moves up with open, unrealized peaks' },
            { left: 'Consistency rule', right: 'No single day can be too big a share of profits' },
            { left: 'Activation fee', right: 'A charge to start the funded stage after passing' },
          ],
        },
        {
          type: 'read',
          title: 'A balanced take',
          html: `<p>There are genuine upsides. Your maximum loss is the fees you pay; you cannot end up owing a broker money the way you can with your own leveraged account. The rules force discipline, like daily loss limits, that many traders need anyway.</p>
<p>The downsides are just as real. Fees add up fast, especially with repeated resets. The rules are designed so that most people fail. And the "only $X to try again" structure can push people toward the same tilt behavior that wrecks normal accounts, just in smaller installments.</p>
<p>A sensible approach if someone does try one: treat the fees as a capped education cost, set a total budget in advance, and stop when it is gone. Most firms also require participants to be adults, so this is a "later, maybe" topic for younger learners.</p>`,
          sprite: { who: 'penny', mood: 'think', say: "Set a fee budget before you start, like a concert ticket. When it is spent, it is spent. No 'one more reset.'" },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: 'How the marketing works on you',
          html: `<p>Prop firm marketing leans on payout screenshots, big account numbers, and influencers, some of whom are paid through affiliate codes for every sign-up. Frequent "sales" on evaluations encourage buying several at once. None of that tells you how many people paid and never got anything back. When you see a flashy payout post, ask two questions: how many fees did this person pay first, and is the person posting it earning a commission on your sign-up?</p>`,
        },
        {
          type: 'numeric',
          question: 'Dev pays $150 a month for evaluations for 6 months and buys 4 resets at $100 each. How much has he spent in total?',
          answer: 1300,
          tolerance: 0.01,
          unit: '$',
          explain: '6 x $150 = $900. 4 x $100 = $400. Total $1,300, before any activation fees. Small recurring fees grow quietly.',
        },
        {
          type: 'quiz',
          questions: [
            { q: 'In a typical prop firm evaluation, what must you do to pass?', options: ['Deposit $50,000', 'Hit a profit target without breaking any rules', 'Trade for one year', 'Pass a government licensing exam'], answer: 1, explain: 'You pay a fee, then must reach the profit target while obeying drawdown, daily loss and other rules.' },
            { q: 'A $2,000 trailing drawdown starts at $48,000 on a $50,000 account. The balance peaks at $52,000 (end of day). If the line keeps trailing, where is it now?', options: ['$48,000', '$50,000', '$52,000', '$46,000'], answer: 1, explain: '$52,000 - $2,000 = $50,000. Note that many firms stop trailing once the line reaches the starting balance, which here happens at exactly this point.' },
            { q: 'Which is generally true about prop firm evaluations?', options: ['They are regulated exactly like futures brokers', 'Fees are protected as segregated customer funds', 'Most participants pass and get paid', 'They are generally not regulated like brokers, so read rules and payout terms carefully'], answer: 3, explain: 'Evaluation fees are purchases, not protected deposits, and most participants do not reach a payout.' },
            { q: 'Why can an intraday trailing drawdown be harsher than an end-of-day one?', options: ['Unrealized peaks you never locked in can raise your failure line', 'It resets every morning', 'It only applies on Fridays', 'It allows larger losses'], answer: 0, explain: 'Open profits that come back still moved the line up, reducing your room even though you never banked them.' },
            { q: 'What is the most sensible way to think about prop firm fees?', options: ['As an investment that will pay back', 'As free money', 'As a capped cost with a budget set in advance', 'As a deposit you get back when you stop'], answer: 2, explain: 'Fees are spent. Setting a hard limit in advance prevents the reset spiral.' },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------
    // Lesson 6: Rules and taxes
    // ------------------------------------------------------------------
    {
      id: 'futures-3-rules-taxes',
      title: 'The Referees and the Tax Bill',
      summary: 'Who regulates US futures markets, how your money is protected (and how it is not), how to check out a firm, and how Section 1256 tax treatment works.',
      minutes: 15,
      icon: 'receipt',
      steps: [
        {
          type: 'read',
          title: 'Who runs the rulebook',
          html: `<p>In the US, stocks are overseen by the SEC. Futures have their own federal regulator: the <span class="term" data-def="Commodity Futures Trading Commission, the US federal agency that regulates futures, options on futures, and swaps markets.">CFTC</span>, the Commodity Futures Trading Commission, created by Congress in <strong>1974</strong>.</p>
<p>The CFTC's job includes:</p>
<ul>
<li>Overseeing futures exchanges like CME Group and the clearinghouses behind them.</li>
<li>Setting rules for the firms that handle customer money.</li>
<li>Policing fraud and manipulation, such as fake trading or "spoofing," placing orders you intend to cancel to trick other traders.</li>
<li>Setting position limits on certain contracts so no one trader can dominate a market.</li>
</ul>
<p>Exchanges also run their own surveillance and discipline programs. CME Group can fine or ban members who break its rules.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Stocks: SEC. Futures: CFTC. Two referees, two rulebooks. Know which one covers the game you are playing." },
        },
        {
          type: 'read',
          title: 'The NFA and registration',
          html: `<p>Alongside the CFTC sits the <span class="term" data-def="National Futures Association, the self-regulatory organization for the US derivatives industry. Firms and individuals doing futures business with the public generally must be members.">NFA</span>, the National Futures Association. It is an industry-wide self-regulatory organization, designated by the CFTC, which began operations in 1982.</p>
<p>Firms and people who do futures business with the public generally must register with the CFTC and join the NFA. The main categories:</p>
<ul>
<li><strong>FCM</strong> (futures commission merchant): the broker that holds your money and carries your positions.</li>
<li><strong>IB</strong> (introducing broker): brings in customers but sends their accounts to an FCM.</li>
<li><strong>CTA</strong> (commodity trading advisor): gives futures trading advice or manages accounts for pay.</li>
<li><strong>CPO</strong> (commodity pool operator): runs a fund that pools money to trade futures.</li>
</ul>
<p>Registration does not mean a firm is good or that you will make money. It means the firm is subject to rules, audits, and discipline if it breaks them.</p>`,
        },
        {
          type: 'match',
          prompt: 'Match each organization or role to what it does.',
          pairs: [
            { left: 'CFTC', right: 'Federal regulator of US futures markets' },
            { left: 'NFA', right: 'Industry self-regulatory organization' },
            { left: 'FCM', right: 'Broker that holds customer funds and positions' },
            { left: 'CTA', right: 'Paid adviser or manager for futures trading' },
          ],
        },
        {
          type: 'read',
          title: 'Segregated funds, and what is not covered',
          html: `<p>FCMs must keep customer money in <span class="term" data-def="Customer money held separately from the broker's own funds, so it cannot be used for the firm's business.">segregated accounts</span>, separate from the firm's own money. The goal: if the broker gets into trouble, customer funds are not mixed in with the firm's assets.</p>
<p>Here is something many people do not know: <strong>SIPC protection, which covers stock brokerage accounts if a broker fails, does not cover futures accounts.</strong> Futures customers rely on segregation rules and bankruptcy procedures instead.</p>
<p>Those rules got a real test in 2011, when the large FCM <strong>MF Global</strong> collapsed and customer segregated funds turned up short. It took a long bankruptcy process before customers recovered their money. Regulators tightened oversight of customer funds afterward. Segregation is a strong protection, but it depends on firms following the rules.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Futures accounts are not SIPC-protected the way stock accounts are. Choose who holds your money as carefully as you choose your trades." },
        },
        {
          type: 'truefalse',
          statement: 'If a futures broker fails, SIPC insurance protects customer futures accounts the same way it protects stock accounts.',
          answer: false,
          explain: 'SIPC does not cover futures. Futures customers are protected mainly by segregation of customer funds and the bankruptcy rules that apply to FCMs.',
        },
        {
          type: 'read',
          title: 'Check before you trust: NFA BASIC',
          html: `<p>The NFA runs a free public lookup tool called <strong>BASIC</strong> (Background Affiliation Status Information Center). You can search any firm or individual and see:</p>
<ul>
<li>Whether they are registered with the CFTC and an NFA member, and in what roles.</li>
<li>Any regulatory or disciplinary actions by the NFA, the CFTC, or exchanges.</li>
</ul>
<p>If someone offers to manage your money in futures, sells a futures trading signal service for pay, or claims to be a broker, look them up. "I am not registered, but trust me" is a red flag. Many fraud cases involve people who were never registered at all.</p>
<p>The CFTC also publishes warnings about common scams, like fake "guaranteed return" commodity pools and romance scams that end in fake trading platforms.</p>`,
        },
        {
          type: 'order',
          prompt: 'Put these steps for checking out a futures broker or adviser in a sensible order.',
          items: ['Get the exact legal name of the firm or person', 'Search them on NFA BASIC', 'Check registration status and any disciplinary history', 'Read the account agreement, fees and liquidation policy', 'Only then decide whether to open an account'],
          explain: 'Identify, look up, review history, read the documents, then decide. Skipping straight to "open account" is how people end up with unregistered operators.',
        },
        {
          type: 'read',
          title: 'Taxes: the 60/40 rule',
          html: `<p>Now the tax bill. In the US, most exchange-traded futures are <span class="term" data-def="A category in the US tax code that includes regulated futures contracts and some other instruments, like broad-based index options, with special tax treatment.">Section 1256 contracts</span>, and they get unusual treatment.</p>
<p>Normally, gains on investments held one year or less are short-term and taxed at ordinary income rates, while gains held longer than a year get lower long-term rates. Section 1256 ignores holding period:</p>
<p><span class="hl">60% of the net gain or loss is treated as long-term and 40% as short-term, no matter how long you held the position.</span></p>
<p>Held for three minutes or three months, same 60/40 split. For active traders, this can mean a lower overall rate than they would pay on the same short-term stock trades. At the top federal brackets, the blended rate works out to about 26.8% (60% x 20% + 40% x 37%), before other taxes like the 3.8% net investment income tax or state tax.</p>
<p>Tax law changes and every situation differs. Treat this as a simplified overview and confirm details with a qualified tax professional.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "60/40 regardless of holding period. A three-minute futures trade gets mostly long-term treatment. The tax code has some odd corners." },
        },
        {
          type: 'numeric',
          question: 'Leo has a net Section 1256 futures gain of $8,000 for the year, all from trades held a few days. How much of it is treated as long-term?',
          answer: 4800,
          tolerance: 0.01,
          unit: '$',
          explain: '60% of $8,000 = $4,800 long-term. The other 40%, $3,200, is short-term. Holding period does not matter for Section 1256 contracts.',
        },
        {
          type: 'read',
          title: 'Marked to market at year end',
          html: `<p>Section 1256 has a second twist that matches what you learned about daily settlement: open positions are treated as if sold at fair market value on the <strong>last business day of the year</strong>.</p>
<p>Example: Leo buys 1 MES at 6,000 on December 15. On December 31 it settles at 6,040. Even though he still holds it, he reports a <strong>$200</strong> gain (40 points x $5) for that year. His starting point for next year becomes 6,040.</p>
<p>If he then sells on January 10 at 6,020, he reports a <strong>$100 loss</strong> for the new year (20 points x $5). Over both years, the total is +$100, matching his real result of 6,020 - 6,000 = 20 points.</p>
<p>So you cannot push a futures gain into next year just by holding on past New Year's Eve.</p>`,
        },
        {
          type: 'numeric',
          question: 'Maya is long 2 MES bought at 6,100. On the last business day of the year they settle at 6,085. What gain or loss counts for this tax year? (Negative for a loss.)',
          answer: -150,
          tolerance: 0.01,
          unit: '$',
          explain: '6,085 - 6,100 = -15 points. -15 x $5 x 2 = -$150, counted this year even though the position is still open.',
        },
        {
          type: 'read',
          title: 'Wash sales, forms and other details',
          html: `<p>A few more points, simplified:</p>
<ul>
<li><strong>No wash-sale problem.</strong> The wash-sale rule can block a loss on stocks if you rebuy within 30 days. Because Section 1256 contracts are marked to market, the wash-sale rule generally does not apply to them.</li>
<li><strong>Forms.</strong> Brokers usually report your net Section 1256 result on Form 1099-B, and it goes on IRS Form 6781.</li>
<li><strong>Loss carryback.</strong> Individuals may be able to elect to carry a net Section 1256 loss back up to three years, but only against Section 1256 gains in those years.</li>
<li><strong>Not everything gets 1256 treatment.</strong> Payouts from a prop firm evaluation, for example, are generally not your own futures gains and may be taxed very differently, often as ordinary or self-employment income.</li>
<li><strong>States vary.</strong> State income tax rules differ.</li>
</ul>
<p>Keep good records of every trade and every payout, and get help from a tax professional before filing.</p>`,
        },
        {
          type: 'check',
          question: 'Dev made a net $5,000 on ES futures trades that each lasted less than an hour. How is that gain generally treated for US federal tax purposes?',
          options: ['100% short-term, because he held each trade less than a year', '100% long-term, because futures are long-term assets', '60% long-term and 40% short-term under Section 1256', 'Not taxable until he withdraws the money'],
          answer: 2,
          explain: 'Regulated futures are Section 1256 contracts: 60% long-term, 40% short-term regardless of holding period. Gains are taxable in the year earned, withdrawn or not.',
        },
        {
          type: 'callout',
          variant: 'warn',
          title: 'This is not tax advice',
          html: `<p>Everything here is a simplified, general description of US federal tax rules as commonly applied to regulated futures. Rates, brackets and rules change, personal situations vary, and there are exceptions this lesson does not cover. Anyone trading futures for real should confirm their own treatment with a qualified tax professional. Also note that futures accounts generally require you to be an adult, so for younger learners this is preparation for later.</p>`,
        },
        {
          type: 'quiz',
          questions: [
            { q: 'Which federal agency regulates US futures markets?', options: ['The SEC', 'The Federal Reserve', 'The CFTC', 'The FDIC'], answer: 2, explain: 'The Commodity Futures Trading Commission, created in 1974, oversees futures markets. The SEC oversees securities like stocks.' },
            { q: 'What can you check with NFA BASIC?', options: ['A firm\'s registration status and disciplinary history', 'Live futures prices', 'Your tax bill', 'Margin requirements'], answer: 0, explain: 'BASIC is a free lookup showing registration and regulatory actions for firms and individuals in the futures industry.' },
            { q: 'Under Section 1256, a $10,000 net futures gain held for two days is treated as...', options: ['$10,000 short-term', '$4,000 long-term and $6,000 short-term', '$10,000 long-term', '$6,000 long-term and $4,000 short-term'], answer: 3, explain: '60% long-term ($6,000) and 40% short-term ($4,000), regardless of holding period.' },
            { q: 'What protects customer money held by a futures broker (FCM)?', options: ['SIPC insurance', 'Segregation of customer funds from the firm\'s own money', 'FDIC insurance', 'Nothing at all'], answer: 1, explain: 'FCMs must keep customer funds segregated. SIPC and FDIC do not cover futures accounts.' },
            { q: 'Leo holds an open MES position on December 31 with a $300 unrealized gain. For tax purposes, generally...', options: ['The $300 counts for this year because 1256 contracts are marked to market at year end', 'Nothing counts until he closes it', 'Only 40% counts this year', 'It counts only if he withdraws the money'], answer: 0, explain: 'Open Section 1256 positions are treated as sold at year-end fair value, so the gain is reported this year.' },
          ],
        },
      ],
    },
  ],
  bossQuestions: [
    { q: 'An index is at 6,000, rates are 4% a year, dividends 2% a year, and the futures expires in 3 months. Using simple cost of carry, the futures fair value and basis (spot minus futures) are about...', options: ['6,030 and -30', '6,060 and -60', '5,970 and +30', '6,030 and +30'], answer: 0, explain: 'Net carry 2% x 0.25 years x 6,000 = 30 points. Fair value about 6,030. Basis = 6,000 - 6,030 = -30.' },
    { q: 'A long-only oil futures fund rolls monthly during a year of steep contango while spot oil ends the year unchanged. What is the most likely result for the fund?', options: ['It matches spot exactly', 'It beats spot because of positive roll yield', 'It lags spot because of negative roll yield', 'It cannot roll in contango'], answer: 2, explain: 'Rolling in contango means buying pricier later contracts that converge down toward spot, a drag even with flat spot prices.' },
    { q: 'A $450,000 stock portfolio has a beta of 1.0. The index is at 6,000. Which hedge is closest to a full hedge?', options: ['Short 1 ES', 'Short 15 MES', 'Long 15 MES', 'Short 3 ES'], answer: 1, explain: 'MES notional = 6,000 x $5 = $30,000. $450,000 / $30,000 = 15 MES short. One ES ($300,000) would under-hedge, and 3 ES would over-hedge.' },
    { q: 'Dev pays for a prop firm evaluation with a $2,500 intraday trailing drawdown on a $50,000 account. His open profit peaks at +$1,800, and he closes the trade at +$300. Where is his failure line, assuming it has not stopped trailing?', options: ['$47,500', '$49,300', '$47,800', '$50,300'], answer: 1, explain: 'Intraday trailing uses the peak of $51,800. $51,800 - $2,500 = $49,300. His balance is $50,300, leaving only $1,000 of room.' },
    { q: 'Ms. Ortiz has a net Section 1256 gain of $20,000. Using illustrative rates of 15% long-term and 24% short-term, what is the federal tax on it before other taxes?', options: ['$4,800', '$3,000', '$3,720', '$3,960'], answer: 2, explain: '60% x $20,000 = $12,000 at 15% = $1,800. 40% x $20,000 = $8,000 at 24% = $1,920. Total $3,720. Real rates depend on her situation; confirm with a tax professional.' },
  ],
};
