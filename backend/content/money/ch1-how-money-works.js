// Unit 1 "Money Moves", Chapter 1: How Money Actually Works
export default {
  id: 'money-ch1',
  title: 'How Money Actually Works',
  blurb: 'Where money comes from, why it shrinks, who sets interest rates, and how a tap of your phone actually moves dollars.',
  lessons: [
    // ---------------------------------------------------------------- Lesson 1
    {
      id: 'money-1-what-is-money',
      title: 'What Even Is Money?',
      summary: 'Why a piece of paper (or a number on a screen) can buy you a burrito, and the three jobs every kind of money has to do.',
      minutes: 12,
      icon: 'coin',
      steps: [
        { type: 'read', title: 'The trade problem', html: `<p>Imagine there is no money. Maya makes great lattes, and she wants new running shoes. So she walks into the shoe store and offers 40 lattes.</p>
<p>The shoe guy doesn't drink coffee. He wants a haircut. So now Maya has to find a barber who wants lattes, trade lattes for a haircut voucher, then trade the voucher for shoes. Exhausting.</p>
<p>Economists call this the <span class="term" data-def="The lucky situation where two people each have exactly what the other one wants. Barter only works when this happens.">double coincidence of wants</span>. Straight-up <span class="term" data-def="Trading goods or services directly for other goods or services, with no money involved.">barter</span> only works when you want my thing and I want your thing at the same moment. That almost never lines up.</p>
<p>Money fixes this. Maya sells lattes to anyone for dollars, and the shoe guy takes those dollars and spends them on whatever he wants. One middle item that everyone accepts makes millions of trades possible.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Fun fact: historians have found few societies that ran on pure barter. Most used credit, IOUs and favors long before coins.` } },
        { type: 'read', title: 'Money has three jobs', html: `<p>Anything that works as money, from seashells to gold to the dollars in your banking app, has to do three jobs:</p>
<ol>
<li><strong>Medium of exchange.</strong> People accept it in trade. You hand it over, you get stuff.</li>
<li><strong>Store of value.</strong> It still buys something next week or next year. A fish is a bad store of value. By Friday, nobody wants your Monday fish.</li>
<li><strong>Unit of account.</strong> It is the measuring stick for prices. A phone costs $800, a burrito costs $11, so you instantly know a phone is worth about 73 burritos.</li>
</ol>
<p>A thing can be good at some jobs and bad at others. Concert tickets are a decent store of value until the show ends, then they are worth zero. Gold stores value well but is a pain to spend on a burrito.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `Exchange it, save it, price stuff with it. If it can do all three, congrats, it's money.` } },
        { type: 'cards', title: 'Words to know', cards: [
          { front: 'Barter', back: 'Trading stuff for stuff with no money in the middle. Works only when both sides want what the other has.' },
          { front: 'Medium of exchange', back: 'Money as the thing everyone accepts when you buy or sell.' },
          { front: 'Store of value', back: 'Money as a way to carry buying power into the future.' },
          { front: 'Unit of account', back: 'Money as the common measuring stick for prices, debts and paychecks.' },
          { front: 'Legal tender', back: 'Money a government says is valid for paying debts. In the US, that is the dollar.' },
        ] },
        { type: 'match', prompt: 'Match each situation to the job money is doing.', pairs: [
          { left: 'Maya pays $5 for a sandwich', right: 'Medium of exchange' },
          { left: 'Leo saves $200 a month for a car next year', right: 'Store of value' },
          { left: 'A menu lists every item in dollars', right: 'Unit of account' },
        ] },
        { type: 'read', title: 'Commodity money: valuable stuff', html: `<p>The earliest money was usually a <span class="term" data-def="Money that is made of something useful or valuable on its own, like gold, silver, salt or grain.">commodity</span>: grain, cattle, salt, cowrie shells, and later metal. The money had value because the stuff itself had value.</p>
<p>Metal coins took over because metal is durable, easy to split into small amounts, and hard to fake. Some of the oldest known stamped coins come from Lydia (in modern Turkey) around 600 BC.</p>
<p>Commodity money has real problems, though:</p>
<ul>
<li><strong>It is heavy.</strong> Try buying a house with sacks of silver.</li>
<li><strong>Supply is random.</strong> A big gold discovery floods the economy with money and prices jump. A shortage squeezes everyone.</li>
<li><strong>It can be cheated.</strong> Rulers shaved coins or mixed in cheaper metal to stretch their budgets.</li>
</ul>
<p>The next step was paper that <em>stood for</em> metal. A bank note said, in effect, "bring this in and we will give you gold." Lighter, but still tied to how much gold sat in the vault.</p>` },
        { type: 'callout', variant: 'fact', title: 'The dollar left gold behind', html: `<p>The US dollar was linked to gold for a long time. In <strong>1933</strong>, Americans lost the right to swap their dollars for gold coins. In <strong>1971</strong>, President Nixon ended the last link, when foreign governments could no longer trade dollars for US gold. Since then the dollar has been pure <span class="term" data-def="Money that has value because a government declares it legal tender and people trust it, not because it can be swapped for a commodity.">fiat money</span>.</p>` },
        { type: 'truefalse', statement: 'Today, each US dollar can be traded in at the government for a fixed amount of gold stored at Fort Knox.', answer: false, explain: 'That link ended completely in 1971. The dollar is fiat money. The government still owns gold, but your dollar is not a claim on it.' },
        { type: 'read', title: 'So why is a fiat dollar worth anything?', html: `<p>A $20 bill costs only cents to print. So why will a store hand you a pizza for it? A few reasons stack up:</p>
<ul>
<li><strong>You owe taxes in dollars.</strong> The government demands dollars, so everyone needs some. That alone creates steady demand.</li>
<li><strong>It is legal tender.</strong> The law says dollars are valid for paying debts in the US.</li>
<li><strong>Everyone else uses it.</strong> Your boss pays you in dollars, your landlord wants dollars. The more people who use it, the more useful it becomes.</li>
<li><strong>Its supply is managed.</strong> The <span class="term" data-def="The central bank of the United States. It manages the money supply and sets key interest rates.">Federal Reserve</span> tries to keep money from growing so fast that it loses value quickly.</li>
</ul>
<p>Put simply, a dollar is worth something because people trust that other people will accept it tomorrow. That trust is the whole engine.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `When trust breaks, fiat money can melt. At Zimbabwe's 2008 peak, prices doubled about every day. It ended up printing a 100 trillion dollar note.` } },
        { type: 'check', question: 'Leo gets paid in dollars, even though they are not backed by gold. Which reason BEST explains why his landlord still accepts them?', options: ['Dollars can be swapped for silver at any bank', 'People trust others will accept dollars, and taxes and debts are paid in them', 'Paper is expensive, so each bill is valuable', 'The landlord is required to swap them for gold later'], answer: 1, explain: 'Fiat money works on trust plus demand: taxes are owed in dollars, the law makes them legal tender, and everyone else uses them. The paper itself is nearly worthless.' },
        { type: 'read', title: 'Most money is just numbers', html: `<p>Here is a twist: most dollars are not paper at all. Physical cash is only a small slice of the money in the US economy, roughly a tenth of the broad money supply. The rest is <span class="hl">numbers in bank accounts</span>.</p>
<p>When Maya's café pays her by direct deposit and she taps her card for a smoothie, no bills move anywhere. Banks just update their records: her balance goes down, the smoothie shop's balance goes up.</p>
<p>That is why later lessons spend so much time on banks. Banks are not just places that hold money. As you will see, when they make loans, they actually <em>create</em> new deposit money.</p>`,
          sprite: { who: 'penny', mood: 'wow', say: `Your paycheck is mostly a bank's promise written in a database. Weird? Yes. Works? Also yes.` } },
        { type: 'callout', variant: 'myth', title: 'Myth: just print more and everyone is richer', html: `<p>If the government doubled everyone's dollars overnight, would we all be twice as rich? No. There would be twice as many dollars chasing the same number of pizzas, phones and apartments, so prices would climb. Money is a claim on real stuff. Making more claims does not make more stuff. That idea is the heart of the next lesson: <strong>inflation</strong>.</p>` },
        { type: 'callout', variant: 'example', title: 'Is crypto money?', html: `<p>Run Bitcoin through the three jobs. It can work as a <strong>medium of exchange</strong>, but few stores take it. As a <strong>unit of account</strong>, almost nothing is priced in it. As a <strong>store of value</strong>, fans point to its fixed supply, while critics point to price swings of 50% or more in past years. Your takeaway: judge any "money" by how well it does all three jobs, not by the hype.</p>` },
        { type: 'order', prompt: 'Put these forms of money in rough historical order, oldest first.', items: ['Commodity money like grain and shells', 'Stamped metal coins', 'Paper money backed by gold or silver', 'Fiat dollars with no gold link', 'Mostly digital bank balances and card taps'], explain: 'Money moved from useful stuff, to metal, to paper that stood for metal, to paper backed by trust, to numbers in databases. Each step made money lighter and easier to move.' },
        { type: 'quiz', questions: [
          { q: 'What is the main problem with barter?', options: ['Prices are too low', 'Both people must want exactly what the other has', 'The government taxes every trade', 'Goods cannot be counted'], answer: 1, explain: 'Barter needs a double coincidence of wants. Money removes that need, because everyone accepts the same middle item.' },
          { q: 'A restaurant lists every menu item in dollars. Which job of money is that?', options: ['Store of value', 'Medium of exchange', 'Legal tender', 'Unit of account'], answer: 3, explain: 'Using dollars as the measuring stick for prices is the unit of account job.' },
          { q: 'Why is fresh fish a poor form of money?', options: ['It is a bad store of value because it spoils', 'It is too easy to count', 'It cannot be used as a medium of exchange', 'Fish are illegal to trade'], answer: 0, explain: 'Money has to hold value over time. Fish rots, so it fails the store of value test.' },
          { q: 'When did the US dollar lose its last link to gold?', options: ['1913', '1933', '1971', '2008'], answer: 2, explain: 'In 1971 the US stopped letting foreign governments swap dollars for gold. Americans had lost that right for coins back in 1933.' },
          { q: 'Which is NOT a reason a fiat dollar has value?', options: ['Taxes must be paid in dollars', 'Each bill can be exchanged for a set amount of gold', 'It is legal tender for debts', 'Almost everyone else accepts it'], answer: 1, explain: 'Fiat money is not redeemable for gold. Its value comes from tax demand, legal tender status and widespread trust.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 2
    {
      id: 'money-1-inflation',
      title: 'Inflation: The Slow Leak',
      summary: 'Why the same groceries cost more every year, how inflation is measured, and why cash sitting still is quietly losing value.',
      minutes: 13,
      icon: 'fire',
      steps: [
        { type: 'read', title: 'Same burrito, bigger price', html: `<p>Ask anyone over 30 what a movie ticket or a slice of pizza used to cost and get ready for a rant. Prices almost always creep up. That general rise in prices across the economy is <span class="term" data-def="A general rise in prices over time. Each dollar buys a bit less than before.">inflation</span>.</p>
<p>The key idea: when prices go up, your dollars don't change, but what they can buy does. Economists call that buying ability <span class="term" data-def="How much stuff a given amount of money can buy.">purchasing power</span>.</p>
<p>If Maya has $100 in a drawer and prices rise 4% this year, she still has a $100 bill next year. But the groceries that cost $100 now cost $104, so her $100 buys a little less. Nobody stole anything. The leak is silent.</p>
<p>A few percent a year sounds tiny. Over a decade or two, it adds up to a lot, as you are about to see.</p>`,
          sprite: { who: 'penny', mood: 'warn', say: `Cash in a drawer never shrinks on paper. It just buys less every year. Sneaky, right?` } },
        { type: 'read', title: 'How inflation gets measured', html: `<p>In the US, the most famous inflation number is the <span class="term" data-def="Consumer Price Index. A monthly measure of how prices change for a typical basket of things households buy.">CPI</span>, the Consumer Price Index, published every month by the Bureau of Labor Statistics.</p>
<p>The idea is simple. Government data collectors track the prices of a giant "basket" of things people actually buy: rent, groceries, gas, car insurance, haircuts, phone plans, medical care and much more. Housing costs are the biggest piece, about a third of the index.</p>
<p>Each month they ask: how much more (or less) does this same basket cost than it did a year ago? That percentage is the inflation rate you hear on the news, like "CPI rose 3% over the past year."</p>
<p>Your personal inflation can differ. If you don't drive, gas spikes hurt you less. If rent is most of your budget and rents are jumping, you may feel inflation is much worse than the headline number.</p>` },
        { type: 'diagram', name: 'inflation-basket', caption: 'The basket stays the same: same groceries, same rent, same gas. Watch the total climb year after year. That rising total is what CPI tracks.' },
        { type: 'numeric', question: 'A basket of goods cost $200 last year and costs $206 this year. What is the inflation rate?', answer: 3, tolerance: 0.1, unit: '%', explain: 'The increase is $6. Divide by the starting price: 6 / 200 = 0.03, or 3%.' },
        { type: 'read', title: 'Why prices rise', html: `<p>Inflation usually comes from a few sources, often at the same time:</p>
<ul>
<li><strong>Demand-pull:</strong> people and businesses want to buy more than the economy can produce. Too much money chasing too few goods, so sellers raise prices.</li>
<li><strong>Cost-push:</strong> the cost of making things jumps. When oil spikes, shipping, plastic and airline tickets all get pricier.</li>
<li><strong>Expectations:</strong> if workers expect 5% inflation, they ask for 5% raises, and businesses raise prices to cover those raises. Inflation can feed itself.</li>
</ul>
<p>After the pandemic, all three hit at once. Stimulus and savings boosted demand, supply chains were jammed, and energy prices surged. US CPI inflation peaked at about <span class="down">9.1%</span> year over year in June 2022, the highest in roughly 40 years.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Ms. Ortiz saw it first hand. Flour, butter and eggs all spiked, so her croissants went from $3.50 to $4.25.` } },
        { type: 'callout', variant: 'fact', title: 'The Fed aims for about 2%, not 0%', html: `<p>The Federal Reserve's goal is inflation of <span class="hl">2% per year</span> on average over time. Its official target uses a measure called the PCE price index, which runs a little different from CPI but tells a similar story.</p>
<p>Why not zero? A little inflation gives the economy breathing room. Falling prices (deflation) can be worse: people delay buying because things will be cheaper later, and debts become harder to repay.</p>` },
        { type: 'widget', name: 'inflation', props: { amount: 1000, rate: 3, years: 20 }, caption: 'Start with $1,000. Slide the inflation rate and the years. Notice how even 3% a year eats close to half the buying power over 20 years.' },
        { type: 'read', title: 'Nominal vs real: the number that matters', html: `<p>When your bank says your savings earn 4%, that's the <span class="term" data-def="The plain percentage return or growth, before adjusting for inflation.">nominal</span> return. What you actually care about is the <span class="term" data-def="Your return after subtracting inflation. It shows how much your buying power really grew.">real</span> return: how much more stuff you can buy.</p>
<p>A quick shortcut:</p>
<p><strong>Real return ≈ nominal return minus inflation</strong></p>
<table>
<thead><tr><th>Where Maya keeps $1,000</th><th>Nominal</th><th>Inflation</th><th>Real (about)</th></tr></thead>
<tbody>
<tr><td>Checking account</td><td>0%</td><td>3%</td><td><span class="down">-3%</span></td></tr>
<tr><td>Basic savings</td><td>0.5%</td><td>3%</td><td><span class="down">-2.5%</span></td></tr>
<tr><td>High-yield savings</td><td>4%</td><td>3%</td><td><span class="up">+1%</span></td></tr>
</tbody></table>
<p>These rates are illustrations. Savings yields and inflation both change over time, so always compare today's numbers.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: `Nerd version: real return = (1 + nominal) / (1 + inflation) - 1. The shortcut is close enough when rates are small.` } },
        { type: 'numeric', question: 'Leo gets a 5% raise. Inflation that year is 3%. About how much did his real pay rise, in percent?', answer: 2, tolerance: 0.1, unit: '%', explain: 'Real change is about nominal minus inflation: 5% - 3% = 2%. His paycheck grew 5%, but his buying power grew only about 2%.' },
        { type: 'read', title: 'Winners and losers', html: `<p>Inflation does not hit everyone the same way.</p>
<ul>
<li><strong>Hurt:</strong> savers holding cash that earns less than inflation, people on fixed incomes, and workers whose pay doesn't keep up.</li>
<li><strong>Helped:</strong> people with fixed-rate debt. If Leo has a fixed-rate car loan, his payment stays the same while his paycheck (hopefully) rises. He repays with dollars that are worth less.</li>
<li><strong>Mixed:</strong> owners of things whose prices tend to rise with inflation, like real estate or company shares, have historically done better than cash over long periods, but with real ups and downs along the way.</li>
</ul>
<p>Use the <span class="term" data-def="Divide 72 by a yearly rate to estimate how many years it takes something to double.">Rule of 72</span> to feel the long-run effect: at 3% inflation, prices roughly double in 72 / 3 = 24 years. Your $20 lunch becomes a $40 lunch.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Hiding from inflation in risky stuff can backfire. Prices of stocks and houses can drop hard for years. Know the risk you are swapping into.` } },
        { type: 'check', question: 'Inflation unexpectedly jumps to 7%. Who is MOST likely to be hurt?', options: ['Someone with a fixed-rate mortgage', 'A retiree living on a fixed pension that never adjusts', 'A worker whose pay rises 8%', 'A business that can raise its prices easily'], answer: 1, explain: 'A fixed income buys less every year when prices rise. The mortgage holder repays with cheaper dollars, and the worker with an 8% raise is still ahead.' },
        { type: 'truefalse', statement: 'If Maya’s savings account pays 2% and inflation is 3%, her account balance goes down.', answer: false, explain: 'Her balance still grows by 2%. What shrinks is her purchasing power, by about 1% a year. That gap between balance and buying power is the whole point of real vs nominal.' },
        { type: 'cards', title: 'Inflation vocab', cards: [
          { front: 'Inflation', back: 'A general rise in prices, so each dollar buys less.' },
          { front: 'Purchasing power', back: 'How much real stuff a dollar can buy.' },
          { front: 'CPI', back: 'The Consumer Price Index: a monthly measure of prices for a typical household basket.' },
          { front: 'Nominal return', back: 'The raw percentage your money grows, before inflation.' },
          { front: 'Real return', back: 'Your growth after subtracting inflation. The one that tells you if you got richer.' },
          { front: 'Deflation', back: 'A general fall in prices. Sounds nice, but usually signals a weak economy.' },
        ] },
        { type: 'callout', variant: 'tip', title: 'How regular people fight the leak', html: `<p>You can't stop inflation, but you can stop feeding it free money. Keep only what you need for bills in checking. Park savings you will need soon somewhere that pays a competitive rate, like a high-yield savings account. Money you won't touch for many years is what people usually invest, accepting more risk for a better shot at beating inflation. Chapter 2 and later units cover each of these in detail.</p>` },
        { type: 'callout', variant: 'myth', title: 'Myth: falling prices would be awesome', html: `<p>Cheaper stuff sounds great, but broad, lasting deflation is usually a sign of a sick economy. During the Great Depression, US consumer prices fell by about a quarter from 1929 to 1933, while unemployment soared. When prices fall, businesses earn less, cut jobs, and debts get heavier in real terms. That is why the Fed aims for low, steady inflation instead of zero.</p>` },
        { type: 'quiz', questions: [
          { q: 'What does the CPI measure?', options: ['The price of the stock market', 'Changes in prices for a typical basket of household goods and services', 'How many people have jobs', 'The interest rate on savings'], answer: 1, explain: 'The Consumer Price Index tracks the cost of a fixed basket of things households buy, month after month.' },
          { q: 'Your savings earn 1% while inflation runs 4%. Your real return is about...', options: ['+5%', '+3%', '-3%', '0%'], answer: 2, explain: 'Real is about nominal minus inflation: 1% - 4% = -3%. Your balance grows, but it buys less.' },
          { q: 'Using the Rule of 72, how long until prices double at 6% inflation?', options: ['About 6 years', 'About 18 years', 'About 72 years', 'About 12 years'], answer: 3, explain: '72 / 6 = 12 years.' },
          { q: 'Why does the Fed target about 2% inflation instead of 0%?', options: ['A little inflation gives a buffer against harmful deflation', 'The law bans zero inflation', 'Higher inflation always boosts stock prices', 'Banks need inflation to print money'], answer: 0, explain: 'Low, steady inflation gives the economy room to adjust and helps avoid deflation, which can deepen downturns.' },
          { q: 'Leo has a fixed-rate car loan when inflation rises and his pay rises with it. What happens to the real burden of his loan?', options: ['It grows', 'It shrinks', 'It stays exactly the same in real terms', 'The bank raises his rate automatically'], answer: 1, explain: 'His payment is fixed in dollars, but those dollars are worth less and his pay is higher, so the loan gets easier to carry.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 3
    {
      id: 'money-1-how-banks-work',
      title: 'How Banks Make (and Create) Money',
      summary: 'Banks borrow from you cheaply, lend at higher rates, and every new loan creates brand-new money. Here is how that actually works.',
      minutes: 14,
      icon: 'bank',
      steps: [
        { type: 'read', title: 'The world’s simplest business plan', html: `<p>A bank's core business fits on a sticky note: <strong>borrow money cheaply, lend it out for more.</strong></p>
<p>When Maya puts her café paychecks in a savings account, she is basically lending the bank her money. The bank pays her a little interest, say 1% a year. Then the bank lends money to people like Leo for a car at, say, 8%, or to Ms. Ortiz for her bakery at 9%.</p>
<p>The gap between what the bank earns on loans and what it pays on deposits is called the <span class="term" data-def="The difference between the interest rate a bank earns on loans and the rate it pays on deposits.">spread</span>. Multiply a small spread by billions of dollars and you get a very profitable business.</p>
<p>Banks also earn fees: overdraft fees, ATM fees, account fees, and a slice of every card swipe. But for most traditional banks, the lending spread is the main engine.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `So that tiny interest on your savings? The bank is turning around and lending your cash out at a much bigger rate.` } },
        { type: 'read', title: 'Net interest margin', html: `<p>Bankers track the spread with a number called <span class="term" data-def="A bank's interest income minus interest paid, divided by its interest-earning assets. A key measure of bank profitability.">net interest margin</span>, or NIM.</p>
<p>Here's the idea in plain numbers. Imagine a tiny bank:</p>
<ul>
<li>It has <strong>$1,000,000</strong> lent out at an average of <strong>7%</strong>. That earns $70,000 a year in interest.</li>
<li>It pays depositors an average of <strong>2%</strong> on $1,000,000. That costs $20,000.</li>
<li>Net interest income: $70,000 minus $20,000 = <span class="up">$50,000</span>.</li>
</ul>
<p>Divide by the $1,000,000 earning interest and the margin is 5%. Real US banks have averaged closer to about 3% across the industry in recent years, because real loans default, some assets earn less, and competition squeezes rates.</p>
<p>Out of that margin, the bank pays employees, rent, tech, and covers loans that go bad. What's left is profit.</p>` },
        { type: 'numeric', question: 'A small bank lends out $500,000 at 6% and pays 1% interest on $500,000 of deposits. What is its yearly net interest income?', answer: 25000, tolerance: 1, unit: '$', explain: 'Interest earned: $500,000 x 6% = $30,000. Interest paid: $500,000 x 1% = $5,000. Net: $30,000 - $5,000 = $25,000.' },
        { type: 'read', title: 'Fractional reserve banking', html: `<p>Here's what surprises people: the bank does not keep all your money in a vault. It keeps only a fraction as <span class="term" data-def="Cash in the vault plus money a bank keeps in its account at the Federal Reserve.">reserves</span> and lends or invests much of the rest. That's called <span class="term" data-def="A banking system where banks hold only part of their deposits as reserves and use the rest for loans and investments.">fractional reserve banking</span>.</p>
<p>For decades the Fed required banks to hold a set percentage of certain deposits, often 10%, as reserves. Textbooks still teach that rule. But in <strong>March 2020</strong> the Fed cut reserve requirements to <span class="hl">0%</span>, and they have stayed there.</p>
<p>So what stops a bank from lending forever? Mainly:</p>
<ul>
<li><strong>Capital rules:</strong> regulators require banks to fund part of their loans with their own <span class="term" data-def="The bank owners' money, the cushion that absorbs losses before depositors are hurt.">capital</span>, so they can absorb losses.</li>
<li><strong>Liquidity rules:</strong> big banks must keep enough easy-to-sell assets to survive a wave of withdrawals.</li>
<li><strong>Demand and risk:</strong> a bank needs borrowers who want loans and can actually repay them.</li>
</ul>`,
          sprite: { who: 'hoot', mood: 'think', say: `If your textbook says banks must keep 10% in reserve, it is out of date. The requirement has been 0% since March 2020.` } },
        { type: 'read', title: 'Plot twist: loans create money', html: `<p>Ms. Ortiz wants a $50,000 loan for a new oven. The bank approves it. What happens next is wild: the bank does not walk to a vault and grab Maya's savings. It simply <strong>types $50,000 into Ms. Ortiz's checking account</strong>.</p>
<p>That $50,000 deposit didn't exist a minute ago. Maya still has her savings. Ms. Ortiz now has $50,000 too. New money was just created, backed by Ms. Ortiz's promise to repay.</p>
<p>Then Ms. Ortiz pays the oven company. The money lands in the oven company's bank account, at the same bank or another one. <span class="hl">One person's loan becomes someone else's deposit.</span> That deposit can support more lending, and the cycle continues.</p>
<p>It works in reverse too. As Ms. Ortiz repays her loan, that money disappears from the system. So commercial banks, not printing presses, create most of the money people actually use.</p>`,
          sprite: { who: 'bolt', mood: 'wow', say: `Process log: loan approved. Deposit created. Money supply up by 50,000. This is how most new money is born.` } },
        { type: 'diagram', name: 'bank-lending', caption: 'Follow one deposit: part is kept as reserves, part is lent out, and the loan shows up as a fresh deposit somewhere else. The same dollars keep supporting more lending.' },
        { type: 'truefalse', statement: 'When a bank makes a new loan, it must first remove the same amount of money from another customer’s account.', answer: false, explain: 'Nobody’s balance goes down. The bank creates a new deposit for the borrower. That is why bank lending expands the money supply.' },
        { type: 'diagram', name: 'money-flow', caption: 'The big loop: households deposit, banks lend to businesses, businesses pay wages, and wages flow back into deposits. The Fed sits on top, influencing how expensive that borrowing is.' },
        { type: 'read', title: 'When everyone wants out at once', html: `<p>Fractional reserve banking has a weak spot. Most deposits can be withdrawn any day, but loans get repaid slowly over years. If too many depositors show up at once, the bank may not have enough cash ready. That's a <span class="term" data-def="When many depositors rush to withdraw their money at the same time because they fear the bank will fail.">bank run</span>.</p>
<p>In March 2023, Silicon Valley Bank collapsed after depositors tried to pull out about $42 billion in a single day, mostly through phone apps and online transfers. Regulators shut the bank down and took it over the next morning.</p>
<p>The bank had put a lot of deposits into long-term bonds that had lost value when rates rose. Once word spread, fear moved faster than any old-fashioned line out the door.</p>
<p>The good news: everyday depositors have strong protection through deposit insurance, which you'll learn about in the next chapter.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Banks are safe because of rules and insurance, not because your cash sits in a vault with your name on it. It doesn't.` } },
        { type: 'check', question: 'Since the Fed set reserve requirements to 0% in 2020, what MOSTLY limits how much a bank can lend?', options: ['Nothing, banks can lend unlimited amounts', 'Capital rules, liquidity rules, and having creditworthy borrowers', 'The amount of paper cash the Treasury prints', 'A rule that loans can never exceed one year of deposits'], answer: 1, explain: 'Banks need enough capital to absorb losses, enough liquid assets to handle withdrawals, and borrowers who will actually repay. Those are the real brakes.' },
        { type: 'match', prompt: 'Match each banking term to its meaning.', pairs: [
          { left: 'Deposit', right: 'Money a customer keeps at the bank, which the bank owes back' },
          { left: 'Loan', right: 'Money the bank provides that the borrower must repay with interest' },
          { left: 'Reserves', right: 'Cash in the vault plus the bank’s account at the Fed' },
          { left: 'Capital', right: 'Owners’ money that absorbs losses first' },
          { left: 'Net interest margin', right: 'Interest earned minus interest paid, as a percentage' },
        ] },
        { type: 'cards', title: 'Bank vocab', cards: [
          { front: 'Spread', back: 'The gap between the rate a bank charges borrowers and the rate it pays savers.' },
          { front: 'Fractional reserve banking', back: 'Banks keep only part of deposits on hand and lend or invest the rest.' },
          { front: 'Reserve requirement', back: 'A rule forcing banks to hold a set share of deposits as reserves. In the US it has been 0% since March 2020.' },
          { front: 'Capital requirement', back: `A rule forcing banks to fund part of their assets with owners' money, to absorb losses.` },
          { front: 'Bank run', back: 'A rush of withdrawals driven by fear that a bank will fail.' },
        ] },
        { type: 'callout', variant: 'fact', title: 'Where your deposit actually goes', html: `<p>A bank's money mostly ends up in three places. <strong>Loans:</strong> mortgages, car loans, business loans and credit cards. <strong>Securities:</strong> things like US Treasury bonds and mortgage bonds, which pay interest and can be sold for cash. <strong>Reserves:</strong> money parked in the bank's own account at the Fed, which also earns interest set by the Fed. A bank constantly balances these: loans pay the most but are slow to turn into cash, reserves pay less but are instantly available.</p>` },
        { type: 'callout', variant: 'tip', title: 'Banks vs credit unions', html: `<p>A <strong>credit union</strong> does the same basic things as a bank: checking, savings, loans. The difference is ownership. Credit unions are nonprofit co-ops owned by their members, so profits tend to come back as lower loan rates, higher savings rates, or fewer fees. You usually need to qualify to join, for example by where you live, work or go to school.</p>` },
        { type: 'quiz', questions: [
          { q: 'What is a bank’s main way of making money?', options: ['Charging ATM fees', 'Selling customers’ data', 'Earning more interest on loans than it pays on deposits', 'Printing new paper currency'], answer: 2, explain: 'The spread between loan rates and deposit rates, measured by net interest margin, is the core of traditional banking.' },
          { q: 'What has the Fed’s reserve requirement been since March 2020?', options: ['0%', '3%', '10%', '25%'], answer: 0, explain: 'The Fed cut reserve requirements to zero in March 2020. Capital and liquidity rules now do most of the limiting.' },
          { q: 'Ms. Ortiz takes out a $50,000 loan and pays an oven company. What happens to that money?', options: ['It disappears immediately', 'It becomes a deposit at the oven company’s bank', 'It goes back into the Fed’s vault', 'It is taken from Maya’s savings account'], answer: 1, explain: 'One person’s loan becomes another person’s deposit. That is how bank lending spreads money through the economy.' },
          { q: 'What happens to the money supply when a loan is repaid?', options: ['It grows', 'It stays the same', 'The bank prints new cash to replace it', 'It shrinks'], answer: 3, explain: 'Lending creates deposit money, and repayment removes it. The process runs both ways.' },
          { q: 'Why can a bank run happen even at a bank that is not losing money on its loans?', options: ['Deposits can leave instantly, but loans are repaid slowly over years', 'Banks are required to close if anyone withdraws', 'Loans are always worth more than deposits', 'Reserve requirements force banks to freeze accounts'], answer: 0, explain: 'Banks turn short-term deposits into long-term loans. If too many people withdraw at once, the cash may not be ready, even if the loans are fine.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 4
    {
      id: 'money-1-the-fed',
      title: 'The Fed and the Price of Money',
      summary: 'Who decides interest rates, what the Fed is trying to do, and how one meeting in Washington changes your credit card bill, your savings and the stock market.',
      minutes: 14,
      icon: 'scale',
      steps: [
        { type: 'read', title: 'Meet the Fed', html: `<p>The <span class="term" data-def="The central bank of the United States, created in 1913. It sets key interest rates and oversees the banking system.">Federal Reserve</span>, nicknamed "the Fed," is the central bank of the United States. Congress created it in 1913 after a string of banking panics.</p>
<p>It has three main parts:</p>
<ul>
<li><strong>The Board of Governors</strong> in Washington, D.C.: seven members appointed by the President and confirmed by the Senate for 14-year terms. One of them serves as Chair, the most-watched economist on the planet.</li>
<li><strong>12 regional Reserve Banks</strong>, in cities like New York, Chicago, Dallas and San Francisco.</li>
<li><strong>The FOMC</strong>, the committee that actually sets interest rate policy.</li>
</ul>
<p>The Fed is the "bank for banks." Banks keep accounts there, borrow from it in emergencies, and move money between each other through its systems. You can't open an account at the Fed, but its decisions show up in nearly every loan and savings account you will ever have.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `The long terms are on purpose. They are meant to keep rate decisions from swinging with every election.` } },
        { type: 'read', title: 'The dual mandate', html: `<p>Congress gave the Fed two big goals, known as the <span class="term" data-def="The Fed's two main goals set by Congress: maximum employment and stable prices.">dual mandate</span>:</p>
<ol>
<li><strong>Maximum employment:</strong> as many people working as the economy can sustain without overheating.</li>
<li><strong>Stable prices:</strong> low, predictable inflation, which the Fed defines as about 2% a year on average.</li>
</ol>
<p>(The law also mentions moderate long-term interest rates, but that usually follows from the other two, so people just say "dual.")</p>
<p>The tricky part is that the two goals can pull in opposite directions. Cheap borrowing helps businesses hire, which is good for jobs, but too much of it can overheat the economy and push prices up. Expensive borrowing cools inflation, but can slow hiring and even tip the economy into a recession.</p>
<p>So the Fed is constantly steering between "too hot" and "too cold," with imperfect data and a big delay before its moves fully kick in.</p>`,
          sprite: { who: 'chip', mood: 'think', say: `Think of it like a shower with a slow-reacting knob. Turn it too far either way and you get scalded or frozen.` } },
        { type: 'read', title: 'The FOMC and the federal funds rate', html: `<p>The <span class="term" data-def="Federal Open Market Committee. The Fed group that votes on interest rate policy.">FOMC</span> has 12 voting members: the seven governors, the president of the New York Fed, and four of the other eleven regional presidents, who rotate each year. It holds eight scheduled meetings a year, plus emergency meetings when needed.</p>
<p>At each meeting it votes on a target for the <span class="term" data-def="The interest rate banks charge each other for overnight loans of reserves. The Fed sets a target range for it.">federal funds rate</span>: the interest rate banks charge each other to borrow reserves overnight. The Fed sets it as a range, such as 4.25% to 4.50%, and uses tools like the interest it pays banks on reserves to keep the actual rate inside that range.</p>
<p>Why does an overnight rate between banks matter? Because it is the base layer. When banks' own cost of money goes up or down, they pass it along to everyone else.</p>
<p>The decision comes out at 2:00 p.m. Eastern time on the final day of the meeting, followed by a press conference from the Chair. Traders hang on every word.</p>` },
        { type: 'cards', title: 'Fed vocab', cards: [
          { front: 'FOMC', back: 'The Fed committee that votes on interest rates, eight scheduled meetings a year.' },
          { front: 'Federal funds rate', back: 'The overnight rate banks charge each other. The Fed sets a target range for it.' },
          { front: 'Basis point', back: 'One hundredth of a percentage point. A 0.25% rate change is 25 basis points.' },
          { front: 'Hawkish', back: 'Leaning toward higher rates to fight inflation.' },
          { front: 'Dovish', back: 'Leaning toward lower rates to support jobs and growth.' },
          { front: 'Prime rate', back: 'A benchmark many banks use for variable-rate loans, usually the top of the fed funds range plus 3 percentage points.' },
        ] },
        { type: 'check', question: 'Inflation is running at 6% and the job market is red hot. What is the Fed MOST likely to do?', options: ['Cut rates to boost hiring', 'Raise rates to cool spending and inflation', 'Leave rates alone forever', 'Print cash and mail it to households'], answer: 1, explain: 'With inflation far above 2% and jobs plentiful, the stable-prices side of the mandate wins. Higher rates make borrowing pricier and slow demand.' },
        { type: 'diagram', name: 'fed-rates', caption: 'Start at the top with the fed funds rate, then follow the arrows to bank rates, mortgages, credit cards and savings. Some links are tight, others are loose.' },
        { type: 'read', title: 'The ripple: from the Fed to your wallet', html: `<p>Here's how a rate change reaches regular people:</p>
<ul>
<li><strong>Credit cards:</strong> most card APRs are variable, set as the <span class="term" data-def="A benchmark interest rate banks use for loans, usually 3 percentage points above the top of the fed funds target range.">prime rate</span> plus a margin. When the Fed moves, prime moves with it, and card APRs typically adjust within a billing cycle or two.</li>
<li><strong>Savings:</strong> online banks often raise high-yield savings rates quickly after hikes, and cut them after cuts. Many big banks barely budge either way.</li>
<li><strong>Car loans and HELOCs:</strong> usually follow short-term rates fairly closely.</li>
<li><strong>Mortgages:</strong> here's the twist. A 30-year fixed mortgage rate tracks the 10-year Treasury yield more than the fed funds rate. That yield reflects what investors expect for inflation and future Fed moves over many years. After the Fed started cutting in September 2024, mortgage rates actually <em>rose</em> for a few months.</li>
</ul>
<p>Rule of thumb: short-term and variable rates follow the Fed closely, long-term fixed rates follow the market's expectations.</p>` },
        { type: 'numeric', question: 'Leo’s credit card APR is the prime rate plus 14 points. Prime is 7.5%. The Fed raises rates by 0.50 points and prime follows. What is Leo’s new APR?', answer: 22, tolerance: 0.01, unit: '%', explain: 'Prime goes from 7.5% to 8.0%. Add the 14-point margin: 8.0% + 14% = 22%.' },
        { type: 'read', title: 'Why stocks care so much', html: `<p>Rate decisions can move the whole stock market in minutes. Three big reasons:</p>
<ul>
<li><strong>Borrowing costs:</strong> companies borrow to build, hire and expand. Higher rates squeeze profits.</li>
<li><strong>Competition from safe yields:</strong> if a Treasury bill pays 5% with almost no risk, investors need a better reason to own risky stocks. When safe yields fall, stocks look more attractive.</li>
<li><strong>Value of future profits:</strong> a dollar of profit ten years from now is worth less today when rates are high. Fast-growing companies whose profits are far in the future get hit hardest.</li>
</ul>
<p>In 2022, the Fed raised rates from near zero at the fastest pace in decades. The S&amp;P 500 fell about 19% that year, and many high-growth tech stocks fell far more.</p>
<p>One more key point: markets react to <em>surprises</em>. If everyone expects a 0.25-point cut and the Fed delivers it, prices may barely move, because it was already "priced in."</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Dev loves betting big right before Fed announcements. The moves can be violent in both directions within seconds. That is gambling on a coin flip.` } },
        { type: 'truefalse', statement: 'The Fed directly sets the interest rate on your 30-year fixed mortgage.', answer: false, explain: 'The Fed sets a target for the overnight federal funds rate. Long-term mortgage rates are set by lenders and track the 10-year Treasury yield, which reflects market expectations.' },
        { type: 'read', title: 'Long and variable lags', html: `<p>Rate changes don't work instantly. Economists say monetary policy works with "long and variable lags," often many months to a year or more before the full effect shows up in jobs and prices.</p>
<p>Recent history shows the whole cycle. The Fed held rates near zero during the pandemic, then hiked from March 2022 to July 2023, reaching a range of 5.25% to 5.50%. Inflation cooled a lot, and the Fed began cutting in September 2024 and continued cutting into 2025.</p>
<p>The dream outcome is a <span class="term" data-def="When the Fed slows inflation without causing a recession.">soft landing</span>: inflation comes down without a recession. The nightmare is a hard landing, where unemployment jumps.</p>
<p>The current target range changes over time, so check the latest number on the Federal Reserve's website or any financial news site before you rely on it.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: `Policy input today, economic output many months later. Steering a giant ship, not a go-kart.` } },
        { type: 'order', prompt: 'The Fed raises rates to fight inflation. Put the ripple in order.', items: ['The FOMC votes to raise the fed funds target range', 'Banks pay more to borrow from each other overnight', 'Banks raise the prime rate', 'Credit card and other variable loan rates rise', 'People and businesses borrow and spend less', 'Pressure on prices eases over the following months'], explain: 'The Fed moves the base rate, banks pass it on, borrowing gets pricier, spending slows, and inflation cools, with a lag.' },
        { type: 'quiz', questions: [
          { q: 'What are the two goals of the Fed’s dual mandate?', options: ['High stock prices and low taxes', 'Maximum employment and stable prices', 'A strong dollar and low gas prices', 'Balanced budgets and low debt'], answer: 1, explain: 'Congress tasked the Fed with maximum employment and stable prices. Taxes and budgets belong to Congress, not the Fed.' },
          { q: 'What is the federal funds rate?', options: ['The rate on 30-year mortgages', 'The tax rate on interest income', 'The rate banks charge each other for overnight loans', 'The rate the government pays on savings bonds'], answer: 2, explain: 'It is the overnight interbank rate. The Fed sets a target range and steers the actual rate into it.' },
          { q: 'The Fed cuts rates by 0.25 points. Which rate is MOST likely to follow quickly?', options: ['A variable credit card APR', 'An existing 30-year fixed mortgage', 'A 5-year fixed CD already opened', 'A fixed-rate federal student loan already taken out'], answer: 0, explain: 'Variable card APRs are tied to prime, which follows the Fed. Fixed-rate loans and CDs already locked in do not change.' },
          { q: 'Why do higher interest rates often push stock prices down?', options: ['They ban companies from borrowing', 'They make safe investments more attractive and future profits worth less today', 'They automatically lower company sales by law', 'They force investors to sell stocks'], answer: 1, explain: 'Higher safe yields compete with stocks, borrowing gets pricier, and future earnings are discounted more heavily.' },
          { q: 'How many voting members does the FOMC have?', options: ['7', '9', '24', '12'], answer: 3, explain: 'Seven governors, the New York Fed president, and four rotating regional presidents make 12.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 5
    {
      id: 'money-1-payment-rails',
      title: 'How Money Moves: Tap, Transfer, Wire',
      summary: 'What really happens in the two seconds after you tap your card, why deposits sit on "pending," and how ACH, wires, instant payments and Venmo actually move dollars.',
      minutes: 15,
      icon: 'bolt',
      steps: [
        { type: 'read', title: 'Two seconds at the bakery', html: `<p>Maya taps her debit card to buy a $6 croissant and coffee at Ms. Ortiz's bakery. The screen says "Approved" almost instantly. Behind that beep, at least five players just talked to each other:</p>
<ul>
<li><strong>Cardholder:</strong> Maya.</li>
<li><strong>Merchant:</strong> Ms. Ortiz's bakery.</li>
<li><strong>Acquirer:</strong> the bakery's payment processor or bank, which accepts card payments for her.</li>
<li><strong>Card network:</strong> Visa, Mastercard, American Express or Discover. The network is the messenger and rulebook connecting everyone.</li>
<li><strong>Issuer:</strong> Maya's bank, the one whose name is on her card.</li>
</ul>
<p>The tap sends a message from the bakery's terminal to the acquirer, through the network, to Maya's bank. Her bank checks: is the card real, does it look like fraud, and does she have the money (or credit) for this? It answers yes or no, and the answer races back the same way. That whole trip is the <span class="term" data-def="The instant check where your bank approves or declines a card purchase and sets the money aside.">authorization</span>.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: `Five companies, one croissant, about two seconds. Modern payments are basically a relay race at light speed.` } },
        { type: 'read', title: 'Why "pending" exists', html: `<p>Here's the catch: <strong>approval is not payment.</strong> When Maya's bank approves the tap, it puts a <span class="term" data-def="Money set aside for an approved purchase that has not finished settling yet.">hold</span> on $6. That's the "pending" line in her app. No money has actually moved yet.</p>
<p>Later, usually that night, the bakery sends its whole day of approved sales in a batch. The networks sort out who owes whom, a step called <span class="term" data-def="The behind-the-scenes process where banks actually move money to finish a payment.">settlement</span>. The money finally moves, and Ms. Ortiz typically sees it in her account a business day or two later.</p>
<p>Pending also explains some weird moments:</p>
<ul>
<li>Gas pumps and hotels often hold more than you end up spending, because they don't know the final amount yet. The extra hold drops off later.</li>
<li>A restaurant charge can change after you add a tip.</li>
<li>A deposit you made can show up but not be fully usable yet, because the money is still traveling.</li>
</ul>`,
          sprite: { who: 'penny', mood: 'think', say: `Pending money still counts against your available balance. Spend it twice and you might overdraft. Ouch.` } },
        { type: 'read', title: 'Who pays for the swipe?', html: `<p>Card payments feel free to you, but the merchant pays fees on every one. The biggest piece is <span class="term" data-def="A fee the merchant's side pays to the cardholder's bank on each card transaction. Set by the card networks.">interchange</span>, which goes to the card issuer. The network takes a smaller fee, and the acquirer adds its own markup.</p>
<p>All in, accepting a credit card often costs a merchant somewhere around 2% to 3% of the sale, depending on the card and the business. Premium rewards cards usually cost merchants more, and that money helps pay for your points and cash back.</p>
<p>Debit cards are often cheaper for merchants. For large US banks, federal rules cap debit interchange, for years at roughly 21 cents plus a tiny percentage per purchase. The Fed has proposed lowering that cap, so the exact number may change.</p>
<p>For Ms. Ortiz, thousands of small card sales a month add up to real money. That's why some small shops have a card minimum, add a card surcharge where it's legal, or offer a cash discount.</p>` },
        { type: 'match', prompt: 'Match each player in a card payment to its role.', pairs: [
          { left: 'Issuer', right: 'The cardholder’s bank that approves the purchase' },
          { left: 'Acquirer', right: 'The merchant’s processor or bank that accepts card payments' },
          { left: 'Card network', right: 'Visa or Mastercard, routing messages and setting rules' },
          { left: 'Interchange', right: 'Fee paid on each card sale, mostly to the issuer' },
        ] },
        { type: 'diagram', name: 'payment-rails', caption: 'Four main ways money moves: card swipes, ACH batches, wires and instant payments. Compare how fast each one finishes and whether it can be undone.' },
        { type: 'read', title: 'ACH: the quiet workhorse', html: `<p>Most of your paychecks, rent payments, and bank-to-bank transfers ride on <span class="term" data-def="Automated Clearing House. A US network that moves payments between bank accounts in batches.">ACH</span>, the Automated Clearing House network. It moves trillions of dollars a year, and most people never hear its name.</p>
<p>ACH works in <strong>batches</strong>. Instead of sending each payment instantly, banks collect lots of them and send files several times a day. The Fed and a private operator called The Clearing House process those files, and banks settle up.</p>
<ul>
<li><strong>Standard ACH</strong> typically takes about 1 to 3 business days. Weekends and bank holidays don't count, which is why a Friday transfer can feel slow.</li>
<li><strong>Same-day ACH</strong> exists too, settling within the same business day if sent before cutoff times.</li>
</ul>
<p>Direct deposit is ACH. Paying a bill from your bank account is usually ACH. Moving money from your savings at one bank to checking at another is usually ACH.</p>
<p>Ever seen an app offer "get paid up to two days early"? Your employer's ACH file often arrives at the bank before the official settlement date. Some banks simply credit you as soon as the file shows up.</p>` },
        { type: 'read', title: 'Wires: big, fast and final', html: `<p>A <span class="term" data-def="A direct bank-to-bank transfer, settled one payment at a time, usually the same day and final once sent.">wire transfer</span> sends money one payment at a time, not in a batch. In the US, many bank wires go through <strong>Fedwire</strong>, run by the Federal Reserve, which settles each payment individually and immediately once it's processed.</p>
<p>Wires are used for big, time-sensitive payments, like the down payment on a house at closing or a large business deal. They usually arrive the same business day, but they run on banking hours, and banks often charge a fee to send one, commonly in the range of $15 to $35 for a domestic wire.</p>
<p>The most important fact about a wire: once it's sent, it's <strong>final</strong>. You can't dispute it like a card charge. If you wire money to a scammer, getting it back is very hard.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Scammers who ask for wires, gift cards or crypto are asking for money you can't claw back. That request alone is a giant red flag.` } },
        { type: 'read', title: 'Instant rails: RTP and FedNow', html: `<p>For decades, the US was slow at moving money compared with places like the UK. That's changing with two <strong>instant payment</strong> systems:</p>
<ul>
<li><strong>RTP</strong> (Real-Time Payments), launched in 2017 by The Clearing House, a company owned by big banks.</li>
<li><strong>FedNow</strong>, launched by the Federal Reserve in July 2023.</li>
</ul>
<p>Both settle payments in seconds, 24 hours a day, 7 days a week, including weekends and holidays. Like wires, these payments are final.</p>
<p>The catch: a bank has to join the network, and not every bank has. Adoption keeps growing, but many people use instant payments without realizing it, through their bank's app or an employer's payroll provider.</p>` },
        { type: 'read', title: 'What Venmo, Cash App and Zelle actually do', html: `<p>When Leo pays Dev $20 for pizza on <strong>Venmo</strong> or <strong>Cash App</strong>, no money moves between banks at that moment. The app just updates its own records: Leo's app balance goes down, Dev's goes up. The real dollars are held by the company, typically at its partner banks.</p>
<p>When Dev moves his balance to his bank, he usually gets two choices: a standard transfer that's free and often rides on ACH (taking a day or a few), or an instant transfer for a fee, usually pushed through card networks.</p>
<p><strong>Zelle</strong> works differently. It's a network owned by a group of big banks and built right into many banking apps. A Zelle payment moves money straight from one bank account to another, usually within minutes when both people are enrolled.</p>
<p>Big warning: P2P payments are built for friends and family. Payments you send are usually treated like handing over cash. If you pay a stranger for concert tickets that never show up, you may not get it back.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Only send P2P money to people you actually know. Paying a stranger? Use a credit card, which has dispute rights.` } },
        { type: 'check', question: 'Leo is buying his first condo and must send $40,000 to the title company the same day, with confirmation it arrived. Which payment method fits best?', options: ['A standard ACH transfer', 'A personal check in the mail', 'A wire transfer, after confirming the instructions by phone', 'Venmo'], answer: 2, explain: 'Wires are built for large, same-day, final payments. Always confirm wire instructions by calling a known phone number, because fake closing emails are a common scam.' },
        { type: 'read', title: 'Checks: still alive', html: `<p>Paper checks feel ancient, but people still write millions of them, for rent, gifts from grandparents, and payments from some businesses.</p>
<p>Today most checks never travel in an envelope between banks. Since a 2003 law, banks can clear checks using digital images, which is why you can deposit one by snapping a photo in your bank's app.</p>
<p>Even so, checks can take time. Federal rules require banks to make some of a check's money available quickly, often by the next business day, but they can hold larger amounts for several days. And here's the scary part: a check can <strong>bounce</strong> even after the money shows as available. If it turns out to be fake, the bank takes the money back from your account.</p>
<p>That gap powers the classic fake check scam: someone "overpays" you with a check and asks you to send back the difference by Zelle or gift card. Days later, the check bounces, and you're out the money you sent.</p>` },
        { type: 'truefalse', statement: 'Once your bank shows a deposited check’s money as available, the check is guaranteed to be real.', answer: false, explain: 'Banks must make funds available quickly by law, often before the check fully clears. A fake check can still bounce days later, and the bank will take the money back.' },
        { type: 'order', prompt: 'Order these from fastest to slowest typical arrival time.', items: ['FedNow or RTP instant payment', 'Domestic wire on a business day', 'Same-day ACH', 'Standard ACH transfer', 'Paper check sent by mail'], explain: 'Instant rails finish in seconds, wires within the business day, same-day ACH by end of day, standard ACH in about 1 to 3 business days, and mailed checks take longest.' },
        { type: 'quiz', questions: [
          { q: 'In a card payment, who is the issuer?', options: ['The store selling the item', 'Visa or Mastercard', 'The merchant’s payment processor', 'The bank that gave the shopper the card'], answer: 3, explain: 'The issuer is the cardholder’s bank. It approves or declines the purchase and collects most of the interchange fee.' },
          { q: 'Why do card purchases show as "pending" at first?', options: ['The purchase was approved but has not settled yet', 'The card was declined', 'The store has not shipped the item', 'The bank is charging an extra fee'], answer: 0, explain: 'Authorization places a hold. Settlement, when money actually moves, happens later, often a day or so after.' },
          { q: 'Which is TRUE about standard ACH transfers?', options: ['They settle in seconds, 24/7', 'They are processed in batches and typically take about 1 to 3 business days', 'They can only move more than $1 million', 'They only work with credit cards'], answer: 1, explain: 'ACH bundles payments into batches. Standard transfers usually take 1 to 3 business days, and same-day ACH is available for faster needs.' },
          { q: 'What launched in July 2023?', options: ['Zelle', 'Venmo', 'FedNow', 'Same-day ACH'], answer: 2, explain: 'FedNow is the Federal Reserve’s instant payment service, launched July 2023. RTP, a private instant system, launched in 2017.' },
          { q: 'Dev pays Leo $25 on Venmo. What happens at that moment?', options: ['Venmo updates its own records, moving the balance between their app accounts', 'A wire transfer is sent from Dev’s bank', 'A paper check is mailed', 'The Fed approves the payment'], answer: 0, explain: 'Inside the app, money moves on Venmo’s own ledger. Real bank transfers happen only when someone adds money or cashes out.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 6
    {
      id: 'money-1-debt-and-interest',
      title: 'Debt, Credit and the Cost of Borrowing',
      summary: 'APR vs APY, simple vs compound interest, good debt vs bad debt, and the minimum-payment trap that keeps people in credit card debt for years.',
      minutes: 15,
      icon: 'card',
      steps: [
        { type: 'read', title: 'Debt is renting money', html: `<p>When you borrow money, you are basically renting it. The amount you borrow is the <span class="term" data-def="The original amount of money borrowed, not counting interest.">principal</span>. The rent you pay for using it is <span class="term" data-def="The cost of borrowing money, usually shown as a yearly percentage of what you owe.">interest</span>.</p>
<p>Lenders charge interest for a few reasons. They could have used that money for something else. Prices may rise while you have it, so the dollars you repay are worth a bit less. And some borrowers never pay back, so lenders charge everyone a little extra to cover those losses.</p>
<p>That last point is why your interest rate depends so much on <em>you</em>. A borrower with a long record of paying on time looks safe and gets a lower rate. A borrower with no history, or a history of missed payments, looks risky and pays more.</p>
<p>Debt isn't automatically good or bad. It's a tool. A tool can build a house or smash your thumb. This lesson is about telling the difference.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `Borrowing lets you get something now and pay over time. The interest rate is the price tag on that convenience.` } },
        { type: 'read', title: 'APR vs APY', html: `<p>Two acronyms show up everywhere, and they are easy to mix up:</p>
<ul>
<li><span class="term" data-def="Annual Percentage Rate. The yearly cost of borrowing, not including the effect of compounding. On some loans it also includes certain fees.">APR</span> (Annual Percentage Rate) is the yearly rate <strong>without</strong> compounding. On loans like mortgages, it also folds in certain fees, so you can compare offers fairly.</li>
<li><span class="term" data-def="Annual Percentage Yield. The yearly rate including the effect of compounding. Used for savings accounts.">APY</span> (Annual Percentage Yield) is the yearly rate <strong>with</strong> compounding baked in. It shows what you actually earn (or owe) over a year.</li>
</ul>
<p>Notice the marketing trick. Banks advertise <strong>APY on savings</strong>, because it's the bigger-looking number. Lenders advertise <strong>APR on loans</strong>, because it's the smaller-looking number.</p>
<p>Credit cards usually compound interest daily. A card with a 24% APR works out to about <span class="down">27%</span> per year in true cost if you carried the balance all year without paying. Same card, scarier number.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: `Formula time: APY = (1 + APR / n) to the power n, minus 1, where n is how many times a year interest compounds.` } },
        { type: 'numeric', question: 'A savings account pays 6% APR, compounded monthly (0.5% per month). What is its APY, to two decimals?', answer: 6.17, tolerance: 0.05, unit: '%', explain: '1.005 to the 12th power is about 1.0617. Subtract 1 and you get about 6.17% APY. Compounding adds a little extra on top of the 6% APR.' },
        { type: 'read', title: 'Simple vs compound interest on debt', html: `<p><span class="term" data-def="Interest charged only on the original principal, not on past interest.">Simple interest</span> is charged only on the principal you owe. <span class="term" data-def="Interest charged on the principal plus any interest that has already been added to the balance.">Compound interest</span> is charged on the principal <em>plus</em> any unpaid interest already added to your balance. Interest on interest.</p>
<p>Imagine borrowing $1,000 at 20% a year and paying nothing for 3 years:</p>
<table>
<thead><tr><th>Year</th><th>Simple</th><th>Compounded yearly</th></tr></thead>
<tbody>
<tr><td>1</td><td>$1,200</td><td>$1,200</td></tr>
<tr><td>2</td><td>$1,400</td><td>$1,440</td></tr>
<tr><td>3</td><td>$1,600</td><td>$1,728</td></tr>
</tbody></table>
<p>The gap grows every year. With compounding, the debt snowballs.</p>
<p>Many car loans and mortgages use simple interest on the remaining principal, and each payment covers that month's interest first. Credit cards are the classic compounding debt: unpaid interest joins the balance and starts charging interest too. Some student loans can also add unpaid interest to the principal, which is called <span class="term" data-def="When unpaid interest is added to a loan's principal, so future interest is charged on it too.">capitalization</span>.</p>` },
        { type: 'diagram', name: 'compound-curve', caption: 'Simple growth is a straight line. Compound growth curves upward. Great when it is your savings, brutal when it is your credit card balance.' },
        { type: 'read', title: 'Good debt, bad debt', html: `<p>People love to sort debt into "good" and "bad." A more useful test asks three questions:</p>
<ol>
<li><strong>What does it buy?</strong> Something that holds value or raises your income, or something that's gone by next week?</li>
<li><strong>What does it cost?</strong> A 6% loan and a 29% loan are very different animals.</li>
<li><strong>Can you comfortably make the payments?</strong> Even a smart loan becomes a problem if it strains your budget.</li>
</ol>
<p>Usually healthier: a reasonable mortgage on a home you can afford, a student loan sized to the career it leads to, or a loan for Ms. Ortiz's new oven that lets her bake twice as many croissants.</p>
<p>Usually harmful: credit card balances for takeout and clothes, and especially <span class="term" data-def="A short-term, high-cost loan meant to be repaid on your next payday.">payday loans</span>. The CFPB has noted that a typical two-week payday loan fee of $15 per $100 borrowed works out to an APR of almost 400%.</p>
<p>Also watch "buy now, pay later" plans. Splitting a purchase into four payments can be interest-free, but stacking several plans at once makes it easy to lose track and miss payments.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Good debt can turn bad fast. Too big a mortgage or a degree with no job plan can sink you just like a maxed-out card.` } },
        { type: 'check', question: 'Which loan best passes the "good debt" test?', options: ['A payday loan to buy concert tickets', 'A 7% equipment loan that lets Ms. Ortiz double her bakery output, with payments she can easily afford', 'Carrying a credit card balance at 27% for new sneakers', 'Three buy-now-pay-later plans for gaming gear you can barely cover'], answer: 1, explain: 'The oven loan has a reasonable rate, buys something that increases income, and has affordable payments. The others fund short-lived purchases at high cost or strain the budget.' },
        { type: 'read', title: 'The minimum-payment trap', html: `<p>Every credit card statement shows a <span class="term" data-def="The smallest amount you must pay by the due date to keep the account in good standing.">minimum payment</span>. Often it's a small slice of the balance, such as about 1% plus that month's interest, with a floor like $25 or $35. Pay at least that and you avoid late fees. That's the good news.</p>
<p>The bad news: minimums are designed to stretch your debt out, and the interest keeps rolling. Leo has <strong>$3,000</strong> on a card at <strong>24% APR</strong>. Interest alone is about $60 a month at first. Here's how the payment changes everything:</p>
<table>
<thead><tr><th>Monthly payment</th><th>Time to pay off</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>$90</td><td>about 56 months</td><td><span class="down">about $1,990</span></td></tr>
<tr><td>$150</td><td>about 26 months</td><td>about $870</td></tr>
<tr><td>$200</td><td>about 19 months</td><td><span class="up">about $600</span></td></tr>
</tbody></table>
<p>(Assumes no new purchases and a fixed payment. A true minimum usually shrinks as the balance shrinks, which makes it take even longer.) By law, card statements must show how long it would take to pay off the balance with only minimum payments. Read that box. It's eye-opening.</p>`,
          sprite: { who: 'penny', mood: 'warn', say: `At $90 a month, Leo pays almost $2,000 extra for $3,000 of stuff. That's a lot of my bacon.` } },
        { type: 'widget', name: 'credit-card-payoff', props: { balance: 3000, apr: 24, payment: 90 }, caption: 'Try Leo\'s card: $3,000 at 24% APR. Raise the monthly payment and watch both the payoff time and the total interest drop.' },
        { type: 'truefalse', statement: 'If you pay the minimum on your credit card every month, you avoid paying interest.', answer: false, explain: 'Paying the minimum avoids late fees, but interest is charged on whatever balance you carry. To avoid interest on purchases, you generally need to pay the full statement balance by the due date.' },
        { type: 'read', title: 'Student loans 101', html: `<p>For many people, student loans are the first big debt. The basics:</p>
<ul>
<li><strong>Federal loans</strong> come from the US Department of Education. You apply by filling out the <span class="term" data-def="Free Application for Federal Student Aid. The form that determines eligibility for federal grants, work-study and loans.">FAFSA</span>. Rates are fixed for the life of each loan and are set each year for new loans.</li>
<li><strong>Subsidized</strong> federal loans (for undergrads with financial need) don't charge you interest while you are in school at least half-time. <strong>Unsubsidized</strong> loans start building interest right away.</li>
<li><strong>Private loans</strong> come from banks and other lenders. Rates depend on credit, often need a cosigner for students, and usually have fewer protections, like income-based payment options.</li>
</ul>
<p>Federal student loan rules changed a lot under a 2025 law, including new borrowing limits and repayment plans phasing in from 2026. Check StudentAid.gov for the current rules before you borrow.</p>
<p>A widely used rule of thumb: try to keep total student debt below what you expect to earn in your first year after graduating. Grants and scholarships, which you don't repay, come first.</p>` },
        { type: 'match', prompt: 'Match each term to its meaning.', pairs: [
          { left: 'Principal', right: 'The amount originally borrowed' },
          { left: 'APR', right: 'Yearly borrowing rate, before compounding' },
          { left: 'APY', right: 'Yearly rate including compounding' },
          { left: 'Capitalization', right: 'Unpaid interest added to the loan balance' },
          { left: 'Minimum payment', right: 'Smallest payment that keeps the account current' },
        ] },
        { type: 'callout', variant: 'tip', title: 'Two ways to crush debt faster', html: `<p>If you have several debts, pay the minimum on all of them, then throw every extra dollar at one. The <strong>avalanche</strong> method targets the highest interest rate first, which saves the most money. The <strong>snowball</strong> method targets the smallest balance first, which gives quick wins that keep you motivated. Either beats paying only minimums.</p>` },
        { type: 'quiz', questions: [
          { q: 'A savings account and a loan both say 5%. One is APR, the other APY. Which is true?', options: ['APR includes compounding, APY does not', 'APY includes compounding, APR does not', 'They always mean the same thing', 'APY only applies to mortgages'], answer: 1, explain: 'APY includes compounding, which is why banks advertise it on savings. APR does not, which is why lenders advertise it on loans.' },
          { q: 'You borrow $1,000 at 10% per year and pay nothing for 2 years, compounded yearly. What do you owe?', options: ['$1,200', '$1,100', '$1,210', '$1,020'], answer: 2, explain: 'Year 1: $1,000 x 1.10 = $1,100. Year 2: $1,100 x 1.10 = $1,210. The extra $10 is interest on interest.' },
          { q: 'Why is paying only the minimum on a credit card so costly?', options: ['Interest keeps building on the remaining balance for years', 'Minimum payments carry a special penalty fee', 'It lowers your credit limit to zero', 'The bank doubles the APR'], answer: 0, explain: 'Small payments barely cover interest, so the balance shrinks slowly while interest keeps piling up.' },
          { q: 'Which type of federal student loan does not charge you interest while you are in school at least half-time?', options: ['Private loan', 'Unsubsidized loan', 'Payday loan', 'Subsidized loan'], answer: 3, explain: 'Subsidized loans, for undergrads with financial need, do not charge interest during school. Unsubsidized loans build interest from the start.' },
          { q: 'Leo has a $500 card balance at 25% and a $4,000 car loan at 7%. Using the avalanche method, which gets his extra money first?', options: ['The car loan, because it is bigger', 'The credit card, because it has the higher rate', 'Neither, he should pay only minimums', 'Whichever has the later due date'], answer: 1, explain: 'Avalanche targets the highest rate first. Here the card also has the smaller balance, so snowball would pick it too.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 7
    {
      id: 'money-1-money-across-borders',
      title: 'Money Across Borders',
      summary: 'How exchange rates work, why currencies rise and fall, why the dollar runs the world, and what a strong or weak dollar means for your trip and for Ms. Ortiz\'s vanilla.',
      minutes: 13,
      icon: 'globe',
      steps: [
        { type: 'read', title: 'What is an exchange rate?', html: `<p>Maya is saving for a trip to Mexico City. In Mexico, prices are in pesos, not dollars. To buy tacos there, she needs to swap dollars for pesos.</p>
<p>An <span class="term" data-def="The price of one currency in terms of another.">exchange rate</span> is just the price of one currency in another currency. If the rate is <strong>18 pesos per dollar</strong>, every dollar Maya swaps gets her 18 pesos. Flip it around and one peso costs about 5.6 cents.</p>
<p>Exchange rates move constantly, every second of the trading day. When a currency buys more of other currencies than before, it has <span class="term" data-def="When a currency rises in value against another currency.">appreciated</span> (gotten stronger). When it buys less, it has <span class="term" data-def="When a currency falls in value against another currency.">depreciated</span> (gotten weaker).</p>
<p>So if the rate moves from 18 to 20 pesos per dollar, the dollar strengthened: each dollar now buys more pesos. If it drops to 16, the dollar weakened. The 18 here is just an example, so check a live rate before any real trip.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `An exchange rate is a price tag, just like the price of a burrito. Only here, the thing you are buying is someone else's money.` } },
        { type: 'numeric', question: 'Maya exchanges $200 at a rate of 18 pesos per dollar (ignoring fees). How many pesos does she get?', answer: 3600, tolerance: 0.5, unit: '', explain: '$200 x 18 = 3,600 pesos.' },
        { type: 'read', title: 'Who sets the rate?', html: `<p>For most major currencies, nobody sets it. The dollar, euro, yen, pound and peso <strong>float</strong>, meaning their prices are set by buying and selling in the global foreign exchange market, or <span class="term" data-def="The global market where currencies are traded. The biggest financial market in the world.">forex</span>. Banks, companies, investors, governments and tourists trade trillions of dollars of currencies there every day, making it the largest financial market in the world.</p>
<p>Some countries choose a <span class="term" data-def="A policy where a country keeps its currency at a fixed rate to another currency, often the US dollar.">peg</span> instead, holding their currency at a fixed rate to another one, usually the dollar. Hong Kong and Saudi Arabia are well-known examples. Keeping a peg takes big reserves and discipline, because the central bank must step in to buy or sell its own currency to hold the line.</p>
<p>When you exchange money as a tourist, you never get the market rate exactly. Exchange kiosks and banks add a markup, and some add fees on top. That gap is how they get paid.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Forex trades nearly 24 hours a day on weekdays, handing off from Sydney to Tokyo to London to New York.` } },
        { type: 'read', title: 'Why currencies move', html: `<p>Currency prices respond to supply and demand, and a few big forces drive that demand:</p>
<ul>
<li><strong>Interest rates:</strong> if US rates rise while rates elsewhere stay put, investors around the world want to hold dollars to earn that higher return. More demand, stronger dollar.</li>
<li><strong>Inflation:</strong> a currency that loses buying power fast at home tends to lose value abroad over time too. Countries with very high inflation usually see their currency slide.</li>
<li><strong>Trade and growth:</strong> if the world wants a country's products, buyers need its currency to pay for them. A booming economy also attracts investment.</li>
<li><strong>Fear:</strong> in a global crisis, investors often rush into currencies they see as safe, like the US dollar, the Swiss franc or the Japanese yen. These are called safe havens.</li>
</ul>
<p>Politics, government debt and surprises in the news matter too. That's why even professionals struggle to predict currency moves in the short run.</p>` },
        { type: 'cards', title: 'Currency vocab', cards: [
          { front: 'Exchange rate', back: 'The price of one currency in terms of another.' },
          { front: 'Appreciate', back: 'A currency gets stronger, buying more foreign currency than before.' },
          { front: 'Depreciate', back: 'A currency gets weaker, buying less foreign currency than before.' },
          { front: 'Peg', back: 'A fixed exchange rate that a central bank defends.' },
          { front: 'Reserve currency', back: 'A currency central banks hold in large amounts for trade and emergencies. The dollar is the top one.' },
          { front: 'Safe haven', back: 'An asset or currency investors rush to when they are scared.' },
        ] },
        { type: 'check', question: 'The Fed raises rates while the European Central Bank cuts. All else equal, what tends to happen to the dollar versus the euro?', options: ['The dollar tends to weaken', 'Nothing, rates do not affect currencies', 'The dollar tends to strengthen', 'Both currencies are frozen'], answer: 2, explain: 'Higher US rates make dollar savings and bonds more attractive, so investors buy dollars. That extra demand tends to strengthen the dollar.' },
        { type: 'read', title: 'Strong dollar, weak dollar: who wins?', html: `<p>"Strong dollar" sounds like pure good news. It's not. It depends who you are.</p>
<table>
<thead><tr><th></th><th>Strong dollar</th><th>Weak dollar</th></tr></thead>
<tbody>
<tr><td>American traveling abroad</td><td><span class="up">Trip is cheaper</span></td><td><span class="down">Trip costs more</span></td></tr>
<tr><td>US shoppers buying imports</td><td><span class="up">Imports cheaper</span></td><td><span class="down">Imports pricier</span></td></tr>
<tr><td>US companies selling abroad</td><td><span class="down">Products pricier for foreigners</span></td><td><span class="up">Products cheaper for foreigners</span></td></tr>
<tr><td>Foreign tourists visiting the US</td><td><span class="down">US feels expensive</span></td><td><span class="up">US feels like a bargain</span></td></tr>
</tbody></table>
<p>Big US companies that earn a lot overseas also feel it in their reports. When the dollar is strong, their sales in euros or yen translate into fewer dollars, so their reported results can look weaker even if they sold just as much.</p>` },
        { type: 'read', title: 'Ms. Ortiz and the vanilla problem', html: `<p>Ms. Ortiz buys her vanilla from a farm co-op in Mexico that prices it in pesos. Each order costs <strong>18,000 pesos</strong>. Her dollar cost depends entirely on the exchange rate:</p>
<table>
<thead><tr><th>Pesos per dollar</th><th>Dollar cost of one order</th></tr></thead>
<tbody>
<tr><td>20 (strong dollar)</td><td><span class="up">$900</span></td></tr>
<tr><td>18</td><td>$1,000</td></tr>
<tr><td>16 (weak dollar)</td><td><span class="down">$1,125</span></td></tr>
</tbody></table>
<p>Same vanilla, same farmers, a $225 swing in her cost per order, just from currency moves. If she orders every month, that difference can eat into her profit or force her to raise prices.</p>
<p>Bigger companies often protect themselves with <span class="term" data-def="Using a financial contract to reduce the risk of a price move, like locking in an exchange rate for a future purchase.">hedging</span>, for example locking in an exchange rate months ahead using a forward contract. Small businesses can sometimes do this through their bank, or they negotiate prices in dollars so the supplier carries the currency risk instead.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Currency risk is real risk. A business that ignores it can lose its profit margin without selling a single fewer croissant.` } },
        { type: 'numeric', question: 'The dollar weakens to 15 pesos per dollar. How many dollars does Ms. Ortiz\'s 18,000-peso vanilla order cost now?', answer: 1200, tolerance: 0.5, unit: '$', explain: '18,000 / 15 = $1,200. A weaker dollar buys fewer pesos, so the same order costs more dollars.' },
        { type: 'read', title: 'Why the dollar runs the world', html: `<p>The US dollar is the world's main <span class="term" data-def="A currency that central banks around the world hold in large amounts and use for trade and emergencies.">reserve currency</span>. According to IMF data, central banks hold more than half of their foreign currency reserves in dollars, far more than in euros, yen or anything else. The dollar is also on one side of nearly 9 out of 10 currency trades, and oil and many other commodities are priced in dollars.</p>
<p>Why the dollar? The US has a huge economy, deep and easy-to-trade markets for Treasury bonds, strong legal protections for investors, and a long track record of paying its debts.</p>
<p>That status brings perks. Strong global demand for dollars and Treasuries helps the US government and American borrowers borrow more cheaply. A French official in the 1960s called this America's "exorbitant privilege."</p>
<p>The dollar's share of global reserves has drifted lower over the past two decades, and people regularly debate whether another currency could replace it. So far, no rival comes close.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: `When a crisis hits, even if the trouble started in the US, investors often run toward dollars. That is reserve currency power.` } },
        { type: 'callout', variant: 'tip', title: 'Travel money tips', html: `<p>Airport exchange kiosks often have some of the worst rates. Many credit cards charge a foreign transaction fee, commonly around 3%, while others charge none, so check before you go. If a card machine abroad asks whether to pay in dollars or the local currency, pick the <strong>local currency</strong>. Choosing dollars lets the merchant's provider pick the exchange rate, and it is usually a bad one.</p>` },
        { type: 'match', prompt: 'Match each person to the dollar move that helps them most.', pairs: [
          { left: 'Maya, traveling to Mexico', right: 'A stronger dollar' },
          { left: 'A US company exporting tractors to Brazil', right: 'A weaker dollar' },
          { left: 'Ms. Ortiz, importing vanilla priced in pesos', right: 'A stronger dollar against the peso' },
          { left: 'A Japanese tourist visiting New York', right: 'A weaker dollar' },
        ] },
        { type: 'truefalse', statement: 'A stronger dollar is good news for every American.', answer: false, explain: 'Travelers and importers benefit, but US exporters and companies with big foreign sales can be hurt, and their workers may feel it too.' },
        { type: 'quiz', questions: [
          { q: 'The exchange rate moves from 18 to 20 pesos per dollar. What happened?', options: ['The dollar weakened', 'The peso strengthened', 'Nothing changed', 'The dollar strengthened'], answer: 3, explain: 'Each dollar now buys more pesos, so the dollar appreciated and the peso depreciated.' },
          { q: 'Which change would MOST likely strengthen a country\'s currency?', options: ['Its central bank raises interest rates', 'Its inflation jumps sharply', 'Its exports collapse', 'It prints much more money'], answer: 0, explain: 'Higher interest rates attract foreign investors who need that currency to buy local savings and bonds.' },
          { q: 'Ms. Ortiz pays 18,000 pesos per vanilla order. The dollar weakens from 18 to 16 pesos per dollar. Her cost per order...', options: ['Falls from $1,000 to $900', 'Rises from $1,000 to $1,125', 'Stays $1,000', 'Rises from $1,000 to $1,800'], answer: 1, explain: '18,000 / 18 = $1,000 before. 18,000 / 16 = $1,125 after. A weaker dollar makes imports cost more.' },
          { q: 'What does it mean that the dollar is the world\'s main reserve currency?', options: ['Only Americans can hold dollars', 'The dollar is backed by gold', 'Central banks around the world hold more dollars than any other currency', 'The dollar can never lose value'], answer: 2, explain: 'Central banks hold more than half their foreign reserves in dollars. That status does not mean the dollar cannot weaken.' },
          { q: 'A card terminal in Paris asks Maya to pay in dollars or euros. Which is usually the better choice?', options: ['Euros, the local currency', 'Dollars, to avoid any conversion', 'Whichever is shown first', 'Neither, she must pay cash'], answer: 0, explain: 'Paying in dollars abroad lets the merchant\'s provider set the conversion rate, which is usually worse than her card network\'s rate.' },
        ] },
      ],
    },
  ],
  bossQuestions: [
    { q: 'Maya earns 4.5% APY in a high-yield savings account while inflation runs 3%. Then the Fed cuts rates by a full percentage point and inflation stays at 3%. What is the MOST likely effect on her?', options: ['Her real return rises because inflation falls automatically', 'Nothing, savings rates are fixed by law', 'Her savings yield likely falls, shrinking her real return toward zero', 'Her account balance goes down'], answer: 2, explain: 'Online savings rates tend to follow Fed cuts. If her yield drops to around 3.5% with 3% inflation, her real return falls from about 1.5% to about 0.5%. Her balance still grows; her buying power grows more slowly.' },
    { q: 'Which statement about modern US banking is accurate?', options: ['When a bank makes a loan, it creates a new deposit, and its lending is limited mainly by capital rules and creditworthy borrowers', 'Banks must keep 10% of all deposits in their vaults, so each deposit can only be lent out once', 'Banks lend out only the cash they receive in paper bills', 'The Fed approves every individual loan a bank makes'], answer: 0, explain: 'Loans create deposits. Reserve requirements have been 0% since March 2020, so capital rules, liquidity rules and loan demand are the main limits.' },
    { q: 'The Fed raises rates sharply to fight inflation. Which combination is MOST likely?', options: ['Credit card APRs fall and the dollar weakens', 'Stock prices surge and savings yields fall', 'Mortgage rates are cut by the Fed directly', 'Variable loan rates rise, savings yields rise, and the dollar tends to strengthen'], answer: 3, explain: 'Higher rates flow through prime to variable loans, savers earn more, and higher US yields tend to attract foreign money, strengthening the dollar.' },
    { q: 'A stranger "accidentally" overpays Leo with a $1,500 check and asks him to Zelle back $500. The check shows as available the next day. Why could Leo still lose $500?', options: ['Zelle payments are always reversed after 30 days', 'Banks must release some check funds quickly before a check fully clears, and Zelle payments are hard to reverse', 'Checks can never bounce once deposited by phone', 'The Fed holds all checks for a month'], answer: 1, explain: 'Funds availability rules release money before the check is proven good. When the fake check bounces, the bank takes the money back, but the Zelle payment is already gone.' },
    { q: 'Dev has a credit card at 24% APR that compounds daily and carries a balance all year. What is closest to his true yearly cost, and why?', options: ['About 24%, because APR includes compounding', 'About 12%, because interest is only charged on half the balance', 'About 27%, because daily compounding charges interest on past interest', 'About 48%, because interest is charged twice'], answer: 2, explain: 'APR ignores compounding. With daily compounding, 24% APR works out to roughly 27% a year, which is the APY-style effective cost.' },
  ],
};
