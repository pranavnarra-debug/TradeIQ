// Unit 1 "Money Moves", Chapter 2: Banking & Your Cash
export default {
  id: 'money-ch2',
  title: 'Banking & Your Cash',
  blurb: 'Pick the right accounts, keep your money safe, build a budget and emergency fund, master credit, and finally understand your paycheck.',
  lessons: [
    // ---------------------------------------------------------------- Lesson 1
    {
      id: 'money-2-checking-vs-savings',
      title: 'Checking, Savings and High-Yield Savings',
      summary: 'What each account is for, how to dodge fees and overdrafts, and why where you park your savings can be worth hundreds of dollars a year.',
      minutes: 12,
      icon: 'bank',
      steps: [
        { type: 'read', title: 'Leo\'s first paycheck has to land somewhere', html: `<p>Leo just started his first salaried job. HR asks for his bank account for direct deposit. He has a dusty account from high school. Is that the right place? To answer, you need to know what each type of account is for.</p>
<p>A <span class="term" data-def="A bank account built for everyday spending: debit card, bill pay, direct deposit. Usually pays little or no interest.">checking account</span> is your money hub. Paychecks land there, your debit card pulls from it, and your bills get paid from it. It's built for money going in and out all the time, so it usually pays little or no interest.</p>
<p>A <span class="term" data-def="A bank account built for holding money you are not spending right away. It pays interest.">savings account</span> is the parking lot. Money sits there and earns interest. Banks often limit how many withdrawals or transfers you can make each month, because savings is meant to stay put.</p>
<p>Most people need both: checking for life's daily flow, savings for goals and emergencies.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: `Checking is your wallet. Savings is me, the piggy bank. Please do not shake me every day.` } },
        { type: 'read', title: 'High-yield savings: same safety, better pay', html: `<p>Not all savings accounts pay the same. Many big branch banks pay close to nothing on basic savings, sometimes as little as 0.01% APY. Meanwhile, a <span class="term" data-def="A savings account, usually at an online bank, that pays a much higher interest rate than a typical savings account.">high-yield savings account</span> (HYSA), usually from an online bank or online arm of a bank, can pay many times more.</p>
<p>How can they pay more? Online banks don't run thousands of branches, so they can pass some of those savings to you. They also compete hard for deposits.</p>
<p>Look what that gap means for Maya's $5,000 savings over one year:</p>
<table>
<thead><tr><th>Account</th><th>APY</th><th>Interest in a year</th></tr></thead>
<tbody>
<tr><td>Big-bank basic savings</td><td>0.01%</td><td><span class="down">about $0.50</span></td></tr>
<tr><td>High-yield savings</td><td>4.00%</td><td><span class="up">about $200</span></td></tr>
</tbody></table>
<p>These rates are illustrations. HYSA rates are <strong>variable</strong>: they tend to rise when the Fed raises rates and fall when it cuts. Compare current rates before you choose.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: `Same $5,000, same safety if it's an insured bank, about 400 times the interest. Moving it takes maybe 15 minutes.` } },
        { type: 'numeric', question: 'Maya keeps $3,000 in a high-yield savings account paying 4% APY for one year. About how much interest does she earn?', answer: 120, tolerance: 1, unit: '$', explain: '$3,000 x 0.04 = $120. APY already includes compounding, so this is her total for the year.' },
        { type: 'read', title: 'The fee gauntlet', html: `<p>Banks make money from fees, and some accounts are packed with them. Watch for:</p>
<ul>
<li><strong>Monthly maintenance fees:</strong> often waived if you keep a minimum balance or set up direct deposit. Many online banks and credit unions charge none.</li>
<li><strong>Out-of-network ATM fees:</strong> you can get hit twice, once by the ATM owner and once by your own bank. Some banks reimburse these.</li>
<li><strong>Overdraft fees:</strong> charged when the bank covers a payment you didn't have enough money for.</li>
<li><strong>NSF fees:</strong> "non-sufficient funds," charged when a payment is rejected. Many big banks have dropped these.</li>
<li><strong>Extras:</strong> paper statements, outgoing wires, replacement cards.</li>
</ul>
<p>A $12 monthly fee sounds small. It's $144 a year, which is more than many people earn in interest. The best account fee is $0.</p>` },
        { type: 'read', title: 'Overdraft: the most expensive coffee', html: `<p>Say Leo has $20 in checking and buys a $25 lunch with his debit card. If his bank covers the shortfall, he's <span class="term" data-def="When you spend more than is in your account and the bank covers it, usually for a fee.">overdrawn</span>. Traditionally, that meant a fee of around $35, sometimes per transaction, so a few small purchases could cost more than $100 in fees.</p>
<p>Things have improved. Many large banks have cut overdraft fees or dropped them entirely, and some offer small free buffers. But fees still exist at plenty of banks, so check yours.</p>
<p>A key rule in your favor: for everyday <strong>debit card purchases and ATM withdrawals</strong>, US banks can't charge you an overdraft fee unless you have <strong>opted in</strong> to overdraft coverage. Without opting in, the purchase is usually just declined. Annoying, but free.</p>
<p>Other defenses: low-balance text alerts, and linking your savings so the bank can pull money from it automatically if checking runs short.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `A $5 latte plus a $35 overdraft fee is a $40 latte. Turn on low-balance alerts today.` } },
        { type: 'check', question: 'Which step does the MOST to stop debit card purchases from causing overdraft fees?', options: ['Opting in to overdraft coverage', 'Not opting in to debit card overdraft coverage and turning on low-balance alerts', 'Using the card only on weekends', 'Asking for a higher debit card limit'], answer: 1, explain: 'If you have not opted in, the bank generally cannot charge an overdraft fee on one-time debit card or ATM transactions. Alerts warn you before you run low.' },
        { type: 'read', title: 'Minimums, teens and credit unions', html: `<p>Some accounts need a <strong>minimum opening deposit</strong>, like $25 or $100, and some require you to keep a <strong>minimum balance</strong> to avoid fees or earn the advertised rate. Read the fine print, especially on accounts with flashy rates.</p>
<p>If you're under 18, you usually can't open a checking account alone. Most banks offer teen or student accounts that are <strong>joint</strong> with a parent or guardian, often with no monthly fee and with controls the parent can see. That's a great way to start building money habits before you're on your own.</p>
<p>Don't forget <strong>credit unions</strong>. They're member-owned nonprofits, often with lower fees and better loan rates. Membership usually depends on where you live, work, study, or a family member's membership. Deposits at federally insured credit unions are protected much like bank deposits, which you'll see next lesson.</p>` },
        { type: 'cards', title: 'Account vocab', cards: [
          { front: 'Checking account', back: 'Everyday spending account with a debit card and bill pay. Little or no interest.' },
          { front: 'Savings account', back: 'Account for money you are not spending soon. Pays interest.' },
          { front: 'High-yield savings', back: 'Savings account, usually online, paying a much higher variable rate.' },
          { front: 'APY', back: 'Annual Percentage Yield: your yearly interest rate including compounding.' },
          { front: 'Overdraft', back: 'Spending more than your balance, which the bank may cover for a fee.' },
          { front: 'Maintenance fee', back: 'A monthly charge just for having the account, often waivable.' },
        ] },
        { type: 'read', title: 'A simple setup that works', html: `<p>Here's a setup a lot of people use, and it's easy to copy:</p>
<ol>
<li><strong>Checking</strong> at a no-fee bank or credit union. Paycheck lands here. Bills and debit card come from here. Keep a small cushion so you never cut it close.</li>
<li><strong>High-yield savings</strong> linked to checking. Your emergency fund and short-term goals live here, earning real interest.</li>
<li><strong>Automatic transfer</strong> from checking to savings every payday, so saving happens before you can spend it.</li>
</ol>
<p>Many banks let you split savings into nicknamed buckets, like "Car," "Trip" or "Emergency." That's a small trick with a big effect: it's harder to raid money labeled for something you care about.</p>
<p>Your checking and savings don't even have to be at the same bank. Leo could keep checking at his local credit union and an HYSA at an online bank, moving money between them by ACH.</p>` },
        { type: 'callout', variant: 'tip', title: 'Account shopping checklist', html: `<ul>
<li>Is it a <strong>federally insured</strong> bank or credit union? (Next lesson explains why this matters.)</li>
<li><strong>No monthly fee</strong>, or one that's easy to waive?</li>
<li>Big <strong>free ATM network</strong> or ATM fee refunds?</li>
<li><strong>Competitive APY</strong> on savings, without silly minimums?</li>
<li>Low or no <strong>overdraft fees</strong>?</li>
<li>A <strong>good app</strong> with alerts, mobile check deposit and easy transfers?</li>
</ul>` },
        { type: 'match', prompt: 'Match each need to the best account for it.', pairs: [
          { left: 'Paying rent and using a debit card', right: 'Checking account' },
          { left: 'Earning solid interest on a trip fund', right: 'High-yield savings account' },
          { left: 'A 15-year-old\'s first account', right: 'Joint teen account with a parent' },
          { left: 'Lower loan rates as a member-owner', right: 'Credit union' },
        ] },
        { type: 'truefalse', statement: 'Once you open a high-yield savings account, its interest rate is locked in for good.', answer: false, explain: 'HYSA rates are variable. Banks can change them anytime, and they usually move with the Fed\'s interest rate decisions.' },
        { type: 'callout', variant: 'myth', title: 'Myth: online banks are riskier', html: `<p>An online bank that is FDIC insured gets the same deposit insurance as the giant bank with a branch on every corner. No branches just means lower costs. The real risk is with apps that look like banks but aren't, which is exactly what the next lesson covers.</p>` },
        { type: 'quiz', questions: [
          { q: 'Which account is built for everyday spending and bill payments?', options: ['Certificate of deposit', 'High-yield savings', 'Checking', 'Brokerage account'], answer: 2, explain: 'Checking accounts handle frequent deposits and withdrawals, with a debit card and bill pay.' },
          { q: 'Why can online banks often pay higher savings rates?', options: ['They are not insured', 'They have lower costs without large branch networks and compete for deposits', 'The government pays them extra', 'They invest everything in crypto'], answer: 1, explain: 'Skipping physical branches saves money, and online banks compete on rate to win customers.' },
          { q: 'Leo has $500 in a 0.01% savings account and moves it to a 4% HYSA. About how much more interest does he earn in a year?', options: ['About $0.05 more', 'About $2 more', 'About $40 more', 'About $20 more'], answer: 3, explain: '$500 x 4% = $20, versus about 5 cents at 0.01%. The gain is about $20.' },
          { q: 'For one-time debit card purchases, when can a US bank charge an overdraft fee?', options: ['Only if you opted in to overdraft coverage', 'Any time, for any purchase', 'Only on weekends', 'Never, overdraft fees are illegal'], answer: 0, explain: 'Federal rules require you to opt in before a bank can charge overdraft fees on one-time debit card and ATM transactions.' },
          { q: 'Maya\'s checking account charges $10 a month unless she keeps $1,500 in it. She usually has $400. What is her best move?', options: ['Keep paying $120 a year in fees', 'Switch to an account with no monthly fee or set up a waiver she can meet', 'Withdraw everything as cash', 'Open a second account at the same bank with the same fee'], answer: 1, explain: 'Fees eat money that could be earning interest. Plenty of banks and credit unions offer checking with no monthly fee.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 2
    {
      id: 'money-2-keeping-money-safe',
      title: 'Keeping Your Money Safe',
      summary: 'How FDIC and NCUA insurance protect your deposits, what they do not cover, why some money apps are not banks at all, and how SIPC is different.',
      minutes: 14,
      icon: 'shield',
      steps: [
        { type: 'read', title: 'What if your bank goes under?', html: `<p>During the Great Depression, thousands of US banks failed, roughly 9,000 between 1930 and 1933. When a bank failed, depositors could lose some or all of their savings. People learned to panic at the first rumor, which caused even more bank runs.</p>
<p>Congress responded in 1933 by creating the <span class="term" data-def="Federal Deposit Insurance Corporation. A US government agency that insures deposits at member banks.">FDIC</span>, the Federal Deposit Insurance Corporation. If an insured bank fails, the FDIC makes sure depositors get their insured money back, often by the next business day, frequently by moving accounts to a healthy bank.</p>
<p>According to the FDIC, since it started insuring deposits in 1934, no depositor has lost a penny of insured funds. That track record is why most people don't panic when a bank has trouble.</p>
<p>Credit unions have their own version, the <span class="term" data-def="National Credit Union Administration. A US government agency that insures deposits at federally insured credit unions.">NCUA</span>, with the same basic coverage. Both are backed by the full faith and credit of the US government.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Banks pay premiums to the FDIC, kind of like car insurance. Bank customers don't pay anything to be covered.` } },
        { type: 'read', title: 'The $250,000 rule, decoded', html: `<p>The standard insurance amount is <span class="hl">$250,000 per depositor, per insured bank, per ownership category</span>. Each part matters:</p>
<ul>
<li><strong>Per depositor:</strong> the limit is about you, not each account. Three accounts in your name alone at the same bank share one $250,000 limit.</li>
<li><strong>Per insured bank:</strong> money at a different insured bank gets its own separate $250,000.</li>
<li><strong>Per ownership category:</strong> accounts owned in different ways, like a single account, a joint account, or certain retirement accounts such as IRAs, each get separate coverage.</li>
</ul>
<p>Example: at one bank, Leo has $200,000 in his own savings and shares a $300,000 joint account with his partner. His single account is fully covered. In the joint account, each co-owner's share is covered up to $250,000, so their $150,000 shares are fully covered too.</p>
<p>Coverage is automatic. It includes checking, savings, money market deposit accounts and CDs, plus the interest earned on them.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: `You don't sign up for FDIC insurance. If the bank is insured and the account is a deposit, you're covered automatically.` } },
        { type: 'numeric', question: 'Ms. Ortiz keeps $310,000 in a single-owner savings account at one FDIC-insured bank, and no other accounts there. How much of it is NOT insured?', answer: 60000, tolerance: 1, unit: '$', explain: 'Coverage is $250,000 for her single ownership category at that bank. $310,000 - $250,000 = $60,000 uninsured. Spreading money across two banks would fix it.' },
        { type: 'read', title: 'What is NOT covered', html: `<p>FDIC insurance covers <strong>deposits</strong>. It does not cover things that can go up and down in value, even if you bought them through a bank's website or at a branch. Not covered:</p>
<ul>
<li>Stocks, bonds and mutual funds, including ETFs</li>
<li>Money market <em>funds</em> (different from money market deposit <em>accounts</em>, which are covered)</li>
<li>Crypto of any kind</li>
<li>Annuities and life insurance policies</li>
<li>Whatever is in a safe deposit box</li>
</ul>
<p>US Treasury bills and bonds aren't FDIC insured either. They don't need to be: they're backed directly by the US government.</p>
<p>The test is simple. FDIC protects you if the <strong>bank</strong> fails. It never protects you from an <strong>investment</strong> losing value.</p>` },
        { type: 'check', question: 'Which of these is protected by FDIC insurance?', options: ['Shares of an S&P 500 index fund bought through your bank\'s app', 'A certificate of deposit at an FDIC-insured bank', 'Bitcoin held in a crypto app', 'An annuity sold at a bank branch'], answer: 1, explain: 'A CD at an insured bank is a deposit, so it is covered. Funds, crypto and annuities are investment or insurance products, not deposits.' },
        { type: 'read', title: 'When the app is not a bank', html: `<p>Lots of slick money apps look like banks: debit cards, direct deposit, savings "accounts." But many are <strong>fintech companies</strong> that partner with real banks behind the scenes. Look for small print like "X is a financial technology company, not a bank. Banking services provided by Y Bank, Member FDIC."</p>
<p>In some setups, your money can get <span class="term" data-def="FDIC coverage that passes through a company holding money for you, to you as the owner, only if the bank's records clearly show what you own.">pass-through insurance</span>, but only if the money truly sits at an insured bank and the records clearly show what belongs to you. It protects you if the <em>bank</em> fails. It does <strong>not</strong> protect you if the fintech app or a middleman company fails.</p>
<p>That's exactly what went wrong in 2024. <strong>Synapse</strong>, a middleman company connecting fintech apps to partner banks, went bankrupt in April 2024. Its records of who owned what didn't match the banks' records. Customers of apps that relied on it had their money frozen for months, and many ended up getting back only part of what they were owed.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `"FDIC insured" in an app ad can hide a lot of fine print. Ask: whose bank holds my money, and whose records say it's mine?` } },
        { type: 'callout', variant: 'warn', title: 'Before you trust an app with your cash', html: `<ul>
<li>Find the line that says who the actual bank is. No bank named? Big red flag.</li>
<li>Check that the bank is insured using the FDIC's BankFind tool or the NCUA's credit union locator.</li>
<li>Know that money sitting in a payment app balance, like Venmo or Cash App, may not be insured the same way as a bank account. Read each app's terms.</li>
<li>Don't park large amounts or your whole emergency fund in a balance you don't fully understand.</li>
</ul>` },
        { type: 'read', title: 'SIPC: protection for brokerage accounts', html: `<p>When you start investing, your money sits at a brokerage, not a bank. Brokerages are covered by a different system: <span class="term" data-def="Securities Investor Protection Corporation. Protects brokerage customers if their brokerage fails and their assets are missing.">SIPC</span>, the Securities Investor Protection Corporation.</p>
<p>SIPC protects up to <strong>$500,000</strong> per customer, including up to <strong>$250,000 in cash</strong>, if a member brokerage fails and customer assets are missing. Its main job is getting your stocks and cash back to you, or moved to another brokerage.</p>
<p>What SIPC does <strong>not</strong> do: protect you from investment losses. If you buy a stock at $100 and it drops to $40, that's the market, not a failure, and nobody pays you back. SIPC also generally doesn't cover crypto that isn't a registered security.</p>
<table>
<thead><tr><th></th><th>FDIC / NCUA</th><th>SIPC</th></tr></thead>
<tbody>
<tr><td>Covers</td><td>Bank and credit union deposits</td><td>Brokerage accounts</td></tr>
<tr><td>Limit</td><td>$250,000 per depositor, bank, category</td><td>$500,000, incl. $250,000 cash</td></tr>
<tr><td>Market losses?</td><td>Not applicable</td><td>Never covered</td></tr>
</tbody></table>`,
          sprite: { who: 'bolt', mood: 'think', say: `Rule check. FDIC: protects deposits from bank failure. SIPC: protects missing brokerage assets. Neither one protects you from bad trades.` } },
        { type: 'match', prompt: 'Match each item to what protects it, if anything.', pairs: [
          { left: 'Savings account at a bank', right: 'FDIC' },
          { left: 'Share account at a federally insured credit union', right: 'NCUA' },
          { left: 'Stocks missing after a brokerage fails', right: 'SIPC' },
          { left: 'Stock that drops 50% in a crash', right: 'Nothing, market losses are not insured' },
        ] },
        { type: 'truefalse', statement: 'If Dev\'s stocks drop 40% in a bad month, SIPC will reimburse his losses.', answer: false, explain: 'SIPC only steps in when a brokerage fails and customer assets are missing. Investment losses are the risk of investing, and no agency covers them.' },
        { type: 'read', title: 'Fraud: the other threat', html: `<p>Bank failures are rare. Fraud is not. Federal law gives you protection when someone uses your card or account <em>without your permission</em>:</p>
<ul>
<li><strong>Credit cards:</strong> your legal liability for unauthorized charges is capped at $50, and the major networks advertise $0 liability.</li>
<li><strong>Debit cards:</strong> protection depends on how fast you report. Report a lost card within 2 business days and your loss is capped at $50. Wait longer and it can rise to $500, and if you miss unauthorized charges on your statement for over 60 days, you could lose more.</li>
</ul>
<p>Big catch: if a scammer tricks <em>you</em> into sending the money yourself, by Zelle, wire or gift card, it often isn't treated as unauthorized, and getting it back is much harder.</p>
<p>Your best defenses: turn on transaction alerts, use two-factor authentication, never share one-time codes, and check your accounts weekly.</p>` },
        { type: 'order', prompt: 'Leo spots a $400 charge he didn\'t make on his debit card. Put the best response in order.', items: ['Lock or freeze the card in his bank\'s app', 'Call the bank using the number on the back of the card', 'Dispute the charge and request a new card', 'Change his banking password and review recent transactions', 'Keep watching his statements for anything else odd'], explain: 'Stop the bleeding first, report fast to keep his legal protection, then clean up and keep monitoring.' },
        { type: 'quiz', questions: [
          { q: 'What is the standard FDIC insurance amount?', options: ['$100,000 per account', '$250,000 per depositor, per insured bank, per ownership category', '$500,000 per household', 'Unlimited for all deposits'], answer: 1, explain: 'The standard limit is $250,000 per depositor, per insured bank, per ownership category.' },
          { q: 'Maya has $200,000 at Bank A and $200,000 at Bank B, both FDIC insured, in her own name. How much is insured?', options: ['$250,000', '$200,000', '$0', '$400,000'], answer: 3, explain: 'Each insured bank gets separate coverage, so both $200,000 balances are fully insured.' },
          { q: 'Which is NOT covered by FDIC insurance?', options: ['A money market deposit account', 'A CD', 'A money market mutual fund', 'A checking account'], answer: 2, explain: 'Money market funds are investments. Money market deposit accounts are bank deposits and are covered.' },
          { q: 'What was the main lesson of the 2024 Synapse collapse?', options: ['Fintech app users can lose access to money if a middleman fails, even when partner banks are insured', 'FDIC insurance stopped working in 2024', 'Credit unions are unsafe', 'All online banks failed'], answer: 0, explain: 'Pass-through FDIC insurance protects against a bank failing, not a fintech or middleman failing, and it depends on accurate ownership records.' },
          { q: 'What does SIPC protect?', options: ['Losses when your stocks fall', 'Bank deposits over $250,000', 'Crypto held in any app', 'Customer assets missing when a member brokerage fails'], answer: 3, explain: 'SIPC helps return missing customer assets after a brokerage failure, up to $500,000 including $250,000 cash. It never covers market losses.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 3
    {
      id: 'money-2-where-to-park-cash',
      title: 'Where to Park Your Cash',
      summary: 'CDs, money market accounts, money market funds and Treasury bills: what each one is, how safe it is, and how to compare yields fairly.',
      minutes: 14,
      icon: 'lock',
      steps: [
        { type: 'read', title: 'Safe, available, or paying well?', html: `<p>Maya has saved $4,000 toward a used car she plans to buy in about 18 months. She doesn't want to risk it in the stock market, because a crash right before she needs the money would wreck her plan. But leaving it in checking earns nothing.</p>
<p>For money like this, you are juggling three things:</p>
<ul>
<li><strong>Safety:</strong> will the full amount definitely be there?</li>
<li><strong>Access:</strong> how fast can I get it, and is there a penalty? Finance people call this <span class="term" data-def="How quickly and easily something can be turned into cash without losing value.">liquidity</span>.</li>
<li><strong>Yield:</strong> how much does it earn?</li>
</ul>
<p>You usually can't max out all three. Locking money up for a set time often earns a bit more. Keeping it available any day usually earns a bit less. This lesson covers the main safe parking spots: CDs, money market accounts, money market funds, and Treasury bills.</p>`,
          sprite: { who: 'chip', mood: 'think', say: `Money you need within a couple of years should be boring. Boring is the whole point.` } },
        { type: 'read', title: 'Certificates of deposit (CDs)', html: `<p>A <span class="term" data-def="Certificate of deposit. A bank deposit that pays a fixed rate for a set term, with a penalty for early withdrawal.">CD</span> is a deal with a bank: you leave a set amount for a set term, from a few months to five years or more, and the bank pays a <strong>fixed rate</strong> for that whole time. CDs at insured banks and credit unions are covered by FDIC or NCUA insurance.</p>
<p>The catch is the <span class="term" data-def="A fee for taking money out of a CD before its term ends, usually a set number of months of interest.">early withdrawal penalty</span>. Take money out before the term ends and you usually give up some interest, often a few months' worth, depending on the bank and term. On a short CD, a big penalty can even dip into your original deposit.</p>
<p>Why use a CD? The fixed rate. If rates are expected to fall, locking in today's rate can pay off. If rates rise, you're stuck with your lower rate until the CD matures.</p>
<p>Some variations: <strong>no-penalty CDs</strong> let you withdraw early for free, usually at a slightly lower rate. A <strong>CD ladder</strong> splits money into several CDs that mature at different times, so some cash frees up regularly.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Only lock money in a CD if you're confident you won't need it before maturity. Read the penalty before you sign.` } },
        { type: 'numeric', question: 'Maya puts $2,000 in a 1-year CD paying 4% APY. The penalty for early withdrawal is 3 months of interest. Roughly how much is that penalty?', answer: 20, tolerance: 1, unit: '$', explain: 'A full year of interest is about $2,000 x 4% = $80. Three months is a quarter of that: about $20.' },
        { type: 'read', title: 'Money market account vs money market fund', html: `<p>These two have almost the same name and are totally different things.</p>
<p>A <span class="term" data-def="A bank or credit union deposit account that pays variable interest, often with limited check writing. FDIC or NCUA insured.">money market account</span> (MMA) is a <strong>bank deposit</strong>. It's basically a savings account, sometimes with check writing or a debit card. It's FDIC or NCUA insured, and its rate is variable.</p>
<p>A <span class="term" data-def="A mutual fund that invests in very short-term, high-quality debt like Treasury bills. Not FDIC insured.">money market fund</span> (MMF) is an <strong>investment</strong>, a type of mutual fund usually bought through a brokerage. It holds very short-term, high-quality debt like Treasury bills and aims to keep a steady price of $1 per share while paying interest. Many brokerages automatically park your uninvested cash in one.</p>
<p>Money market funds are considered very low risk, but they are <strong>not FDIC insured</strong> and not guaranteed. In 2008, a large fund called the Reserve Primary Fund "broke the buck," with its shares falling below $1 after losses on debt from the failed bank Lehman Brothers. Rules were tightened after that, and funds that hold only government debt are considered the safest type.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Name trick: "account" lives at a bank and is insured. "Fund" lives at a brokerage and is an investment.` } },
        { type: 'check', question: 'Leo sees "money market" at his bank and at his brokerage. Which is FDIC insured?', options: ['The money market fund at the brokerage', 'Both, since they share a name', 'The money market deposit account at the bank, if the bank is FDIC insured', 'Neither, money markets are never insured'], answer: 2, explain: 'A money market deposit account is a bank deposit and gets FDIC coverage. A money market fund is a mutual fund investment and does not.' },
        { type: 'read', title: 'Treasury bills: lending to Uncle Sam', html: `<p>A <span class="term" data-def="Short-term US government debt that matures in a year or less. Sold at a discount and repaid at face value.">Treasury bill</span>, or T-bill, is a short-term loan to the US government. T-bills mature in a year or less, with terms like 4, 8, 13, 26 and 52 weeks.</p>
<p>They work in a slightly odd way: you buy the bill for <strong>less</strong> than its face value, and at maturity you get the full face value. The difference is your interest. Buy a $1,000 bill for $980, collect $1,000 later, and you earned $20.</p>
<p>Two ways to buy:</p>
<ul>
<li><strong>TreasuryDirect</strong>, the government's own website. Minimum purchase is $100. But if you want your money before maturity, it's clunky.</li>
<li><strong>A brokerage account</strong>. Usually easier, and you can sell a T-bill before it matures, though the price you get could be slightly higher or lower than what you paid plus interest.</li>
</ul>
<p>Two big perks: T-bills are backed by the US government, considered about as safe as it gets for dollars, and their interest is <strong>exempt from state and local income tax</strong>. You still owe federal tax.</p>`,
          sprite: { who: 'bolt', mood: 'happy', say: `Discount price in, face value out. The gap is the interest. Simple machine, very reliable.` } },
        { type: 'numeric', question: 'Leo buys a 13-week T-bill with a $1,000 face value for $990 and holds it to maturity. How much interest does he earn, in dollars?', answer: 10, tolerance: 0.01, unit: '$', explain: 'He pays $990 and receives $1,000 at maturity. The $10 difference is his interest.' },
        { type: 'read', title: 'Comparing yields fairly', html: `<p>Each product quotes its rate a little differently. Banks quote <strong>APY</strong>. Money market funds usually show a <strong>7-day yield</strong>. T-bills show a yield based on the discount. Brokerage sites often convert them so you can compare, and over short periods the differences are small.</p>
<p>The bigger difference is often <strong>taxes</strong>. Interest from savings, CDs and most money market funds is taxed by both the federal government and your state. T-bill interest skips state tax.</p>
<p>Example: Maya lives in a state with a 6% income tax. She compares a 4.2% HYSA with a 4.0% T-bill. After state tax, the HYSA keeps about 4.2% x (1 - 0.06), which is about <strong>3.95%</strong>. The T-bill keeps the full <strong>4.0%</strong> at the state level. Both still owe federal tax, so the T-bill wins by a hair. In a state with no income tax, the HYSA would win.</p>
<p>These rates are only examples. Yields change constantly, so compare current numbers on the day you decide.</p>` },
        { type: 'read', title: 'Side by side', html: `<table>
<thead><tr><th>Option</th><th>Insured?</th><th>Rate</th><th>Getting your money</th></tr></thead>
<tbody>
<tr><td>High-yield savings</td><td>FDIC/NCUA</td><td>Variable</td><td>Any time</td></tr>
<tr><td>Money market account</td><td>FDIC/NCUA</td><td>Variable</td><td>Any time, sometimes by check</td></tr>
<tr><td>CD</td><td>FDIC/NCUA</td><td>Fixed for term</td><td>At maturity, or pay a penalty</td></tr>
<tr><td>Money market fund</td><td>No (SIPC only if the broker fails)</td><td>Variable</td><td>Sell any business day</td></tr>
<tr><td>Treasury bill</td><td>No, backed by US government</td><td>Locked when you buy</td><td>At maturity, or sell through a broker</td></tr>
</tbody></table>
<p>A simple way to match money to a spot: money you might need any day goes in high-yield savings. Money for a known date, like Maya's car in 18 months, can go in CDs or T-bills timed to mature right before she needs it. Cash waiting inside a brokerage account often sits in a money market fund.</p>` },
        { type: 'match', prompt: 'Match each product to its key feature.', pairs: [
          { left: 'CD', right: 'Fixed rate, penalty if you withdraw early' },
          { left: 'Money market account', right: 'Insured bank deposit with a variable rate' },
          { left: 'Money market fund', right: 'Low-risk investment aiming for $1 per share' },
          { left: 'Treasury bill', right: 'Bought at a discount, interest free of state tax' },
        ] },
        { type: 'truefalse', statement: 'The money market fund holding your uninvested cash at a brokerage is FDIC insured.', answer: false, explain: 'A money market fund is an investment, not a bank deposit. It is not FDIC insured. Some brokerages instead sweep cash into partner bank deposits, which can be FDIC insured, so check what your account actually uses.' },
        { type: 'callout', variant: 'fact', title: 'One more option: I bonds', html: `<p>Series I savings bonds, sold on TreasuryDirect, pay a rate tied to inflation, so their value keeps up with rising prices. The trade-offs: purchases are limited (the electronic limit has long been $10,000 per person per year), you can't cash them in for the first 12 months, and cashing out before 5 years costs the last 3 months of interest. Check TreasuryDirect for the current rate and rules.</p>` },
        { type: 'quiz', questions: [
          { q: 'What is the main trade-off of a CD compared with a high-yield savings account?', options: ['A CD has a fixed rate but charges a penalty for early withdrawal', 'A CD is not insured', 'A CD rate changes daily', 'A CD can only be opened at a brokerage'], answer: 0, explain: 'CDs lock in a rate for a term. In exchange, you usually pay a penalty if you pull money out early.' },
          { q: 'Which statement about money market funds is TRUE?', options: ['They are FDIC insured up to $250,000', 'They are mutual funds that aim to hold $1 per share but are not guaranteed', 'They can only hold stocks', 'They are the same as money market accounts'], answer: 1, explain: 'Money market funds invest in short-term debt and aim for a stable $1 share price, but they are investments, not insured deposits.' },
          { q: 'A $1,000 T-bill is bought for $975 and held to maturity. What is the interest earned?', options: ['$975', '$1,000', '$2.50', '$25'], answer: 3, explain: 'You receive face value, $1,000, minus the $975 you paid: $25 in interest.' },
          { q: 'Why might T-bills beat a slightly higher-yielding savings account for someone in a high-tax state?', options: ['T-bills are tax free at every level', 'T-bill interest is exempt from state and local income tax', 'Savings interest is taxed twice federally', 'T-bills pay dividends instead of interest'], answer: 1, explain: 'T-bill interest skips state and local income tax, which can make its after-tax yield higher than a savings account with a slightly higher stated rate.' },
          { q: 'Maya needs her $4,000 for a car in about 18 months and cannot risk losing any. Which choice fits best?', options: ['A single tech stock', 'Crypto', 'A CD or T-bills timed to mature before she needs the money, or a high-yield savings account', 'A 5-year CD with a large early withdrawal penalty'], answer: 2, explain: 'Short-term money with a known date belongs in safe, insured or government-backed options that are available when she needs them.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 4
    {
      id: 'money-2-budgeting',
      title: 'Budgeting That Actually Works',
      summary: 'The 50/30/20 rule, paying yourself first, and the automation tricks that make a budget run itself instead of feeling like a diet.',
      minutes: 13,
      icon: 'calculator',
      steps: [
        { type: 'read', title: 'A budget is a plan, not a punishment', html: `<p>The word "budget" makes a lot of people think of saying no to everything. That's not what it is. A budget is just a plan for where your money goes <em>before</em> it goes there.</p>
<p>Without a plan, money leaks out in small, forgettable pieces: a delivery fee here, a subscription there. At the end of the month you check your balance and wonder where it all went.</p>
<p>With a plan, you decide in advance. Rent, food, a fun budget for concerts, a chunk for savings. Then spending on things you love feels guilt-free, because you already made room for it.</p>
<p>The best budget is the one you'll actually keep. This lesson gives you a simple starting framework, then shows you the automation tricks that make it mostly run itself.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: `A budget is permission to spend. You just decide on the permission ahead of time.` } },
        { type: 'read', title: 'The 50/30/20 rule', html: `<p>One of the most popular starting points is the <span class="term" data-def="A budgeting guideline: 50% of after-tax income to needs, 30% to wants, 20% to savings and extra debt payments.">50/30/20 rule</span>, popularized by Elizabeth Warren and her daughter Amelia Warren Tyagi in their 2005 book <em>All Your Worth</em>. Take your <strong>after-tax income</strong>, the money that actually hits your account, and split it:</p>
<ul>
<li><strong>50% Needs:</strong> things you must pay to live and work. Rent, utilities, groceries, insurance, transportation to work, minimum debt payments.</li>
<li><strong>30% Wants:</strong> things that make life fun but you could cut. Eating out, streaming, concerts, new clothes beyond the basics, travel.</li>
<li><strong>20% Savings and debt payoff:</strong> emergency fund, investing, retirement, and any debt payments above the minimum.</li>
</ul>
<p>If Leo takes home $3,200 a month, that's about $1,600 for needs, $960 for wants and $640 for savings and extra debt payments.</p>
<p>It's a guideline, not a law. It gives you a fast gut check: is any one bucket way out of line?</p>` },
        { type: 'widget', name: 'budget', props: { income: 3200 }, caption: 'Start with Leo\'s $3,200 monthly take-home pay, then try your own number. See how the 50/30/20 split changes with income.' },
        { type: 'numeric', question: 'Maya takes home $900 a month from her café job. Using 50/30/20, how much goes to savings?', answer: 180, tolerance: 0.5, unit: '$', explain: '20% of $900 is $180.' },
        { type: 'read', title: 'Needs vs wants: the gray zone', html: `<p>Sorting needs from wants sounds easy until you try it. A phone is a need for most people. The newest top-end model on a pricey plan is part need, part want. Groceries are a need. Delivery from the same grocery store, with fees and a tip, has a want stacked on top.</p>
<p>A helpful test: <strong>what's the cheapest version that still does the job?</strong> That much is the need. Anything above it is a want. That's not a judgment. Wants are allowed. You just want to count them honestly.</p>
<p>Also, real life doesn't always fit 50/30/20:</p>
<ul>
<li>In expensive cities, rent alone can eat half of take-home pay. Someone there might run <strong>60/20/20</strong> for a while.</li>
<li>A teen living at home, like Maya, may have very few needs. She can save far more than 20%, which is a huge head start.</li>
</ul>
<p>Adjust the percentages to your life. The habit matters more than hitting exact numbers.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `Maya's living at home with low bills. Saving half her paycheck now could set her up for years.` } },
        { type: 'check', question: 'Leo pays $85 a month for a premium phone plan. A basic plan with enough data for him costs $35. How should he count the $85?', options: ['All $85 is a need', 'All $85 is a want', 'About $35 is a need and about $50 is a want', 'It belongs in savings'], answer: 2, explain: 'The cheapest version that does the job is the need. The extra $50 is a want. Counting it that way shows what he could cut if he needs to.' },
        { type: 'read', title: 'Pay yourself first', html: `<p>Most people budget like this: get paid, spend on stuff, save whatever is left. The problem? There's rarely anything left.</p>
<p><span class="term" data-def="Moving money into savings as soon as you get paid, before spending on anything else.">Pay yourself first</span> flips the order. The moment your paycheck lands, a set amount moves to savings. Then you live on the rest.</p>
<p>Why it works: it uses human nature instead of fighting it. We tend to spend what's in our checking account. If the savings is already gone from checking, you adjust your spending without even thinking about it, the same way you don't miss taxes taken out before your paycheck arrives.</p>
<p>Start small if you need to. Even 5% saved automatically beats 20% planned but never done. Then raise it a notch every time you get a raise.</p>` },
        { type: 'read', title: 'Automate everything you can', html: `<p>Willpower is a terrible system. Automation is a great one. Set it up once and it keeps working while you sleep:</p>
<ul>
<li><strong>Split direct deposit:</strong> many employers let you send part of each paycheck straight to a different account, like your high-yield savings.</li>
<li><strong>Automatic transfers:</strong> schedule a transfer from checking to savings for payday.</li>
<li><strong>Autopay bills:</strong> set fixed bills like rent, phone and insurance to pay automatically, so you never miss a due date.</li>
<li><strong>Credit card autopay:</strong> set it to the <strong>full statement balance</strong> if you can, or at least the minimum, so a busy week never turns into a late fee.</li>
<li><strong>Alerts:</strong> low-balance alerts and large-purchase alerts catch problems early.</li>
</ul>
<p>One warning: automation needs a cushion. Keep a small buffer in checking so an autopay never bounces.</p>`,
          sprite: { who: 'bolt', mood: 'happy', say: `Automation complete. Savings: scheduled. Bills: scheduled. Human effort required: almost zero. Beep.` } },
        { type: 'read', title: 'Track it (at least for a month)', html: `<p>You can't plan well if you don't know where your money goes now. Try a <strong>30-day spending audit</strong>: record every purchase for a month using your banking app, a budgeting app, or a simple spreadsheet. Then sort each one into needs, wants or savings.</p>
<p>Most people find a few surprises. Common ones:</p>
<ul>
<li><strong>Subscriptions</strong> you forgot about, like a streaming service you haven't opened in months.</li>
<li><strong>Small daily habits.</strong> A $6 drink every day is about $180 a month, or around $2,190 a year.</li>
<li><strong>Fees:</strong> delivery fees, ATM fees, late fees.</li>
</ul>
<p>The point isn't to ban the $6 drink. It's to decide if it's worth $2,190 a year <em>to you</em>. If yes, enjoy it and cut something you care about less.</p>
<p>Other styles work too. A <strong>zero-based budget</strong> gives every dollar a job until income minus planned spending equals zero. The <strong>envelope method</strong> uses separate cash envelopes or digital buckets for each category.</p>` },
        { type: 'cards', title: 'Budget vocab', cards: [
          { front: '50/30/20', back: 'Needs, wants, savings split of after-tax income.' },
          { front: 'Take-home pay', back: 'What lands in your account after taxes and deductions.' },
          { front: 'Pay yourself first', back: 'Save automatically on payday, then spend what is left.' },
          { front: 'Zero-based budget', back: 'Every dollar of income gets assigned a job, savings included.' },
          { front: 'Sinking fund', back: 'Saving a little each month for a known future cost, like car insurance or holiday gifts.' },
        ] },
        { type: 'order', prompt: 'Put the steps of building a first budget in a sensible order.', items: ['Figure out your monthly take-home pay', 'Track every expense for about 30 days', 'Sort spending into needs, wants and savings', 'Set target amounts for each bucket', 'Automate savings and bills', 'Review and adjust every month'], explain: 'You need real numbers before you can set targets. Then automation locks in the plan, and monthly reviews keep it realistic.' },
        { type: 'truefalse', statement: 'The 50/30/20 rule is based on your gross pay, before taxes.', answer: false, explain: 'It uses after-tax, take-home income, the money you can actually spend.' },
        { type: 'callout', variant: 'tip', title: 'Don\'t forget the not-monthly bills', html: `<p>Budgets often break on costs that don't show up every month: car insurance paid twice a year, birthday gifts, a yearly software subscription, car registration. Add them up for the year, divide by 12, and set that much aside monthly in a <strong>sinking fund</strong>. When the bill arrives, the money is already waiting.</p>` },
        { type: 'quiz', questions: [
          { q: 'Under 50/30/20, which item belongs in the 30% bucket?', options: ['Rent', 'A concert ticket', 'Minimum car loan payment', 'Basic groceries'], answer: 1, explain: 'Concerts are wants. Rent, minimum loan payments and basic groceries are needs.' },
          { q: 'Leo takes home $4,000 a month. Using 50/30/20, how much goes to needs?', options: ['$800', '$1,200', '$2,000', '$2,500'], answer: 2, explain: '50% of $4,000 is $2,000. Wants get $1,200 and savings gets $800.' },
          { q: 'What does "pay yourself first" mean?', options: ['Move money to savings right when you get paid, before spending', 'Buy something fun every payday', 'Pay your own bills before your roommate\'s', 'Save whatever is left at the end of the month'], answer: 0, explain: 'Saving first, automatically, means saving actually happens. Waiting for leftovers usually means saving nothing.' },
          { q: 'Maya spends $5 on a drink every school day, about 20 days a month. About how much is that per year?', options: ['$100', '$600', '$365', '$1,200'], answer: 3, explain: '$5 x 20 = $100 a month. $100 x 12 = $1,200 a year.' },
          { q: 'Ms. Ortiz pays $1,200 for business insurance once a year. What is the best budget approach?', options: ['Ignore it until the bill arrives', 'Put it on a credit card and pay the minimum', 'Set aside $100 a month in a sinking fund', 'Skip insurance to save money'], answer: 2, explain: '$1,200 / 12 = $100 a month. A sinking fund turns a big surprise into a small, planned expense.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 5
    {
      id: 'money-2-emergency-fund',
      title: 'Emergency Funds: Your Financial Airbag',
      summary: 'How much to save for life\'s surprises, where to keep it so it is safe and ready, and how to tell a real emergency from a really good sale.',
      minutes: 12,
      icon: 'shield',
      steps: [
        { type: 'read', title: 'The $1,800 surprise', html: `<p>Leo is cruising along at his new job when his car's transmission dies. The repair: <strong>$1,800</strong>. He needs the car to get to work.</p>
<p>If Leo has no savings, he puts it on a credit card at 24% APR. Paying $100 a month, that repair takes him about 2 years to pay off and costs roughly $450 extra in interest. Worse, he's now stressed, and the next surprise piles on top.</p>
<p>If Leo has an <span class="term" data-def="Money set aside only for unexpected, necessary expenses like job loss, medical bills or urgent repairs.">emergency fund</span>, he moves $1,800 from savings to checking, pays the mechanic, and gets on with his week. Annoying? Sure. A crisis? No.</p>
<p>That's the whole idea. An emergency fund turns emergencies into inconveniences. It also protects everything else you're building, because you don't have to sell investments or rack up debt at the worst possible moment.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: `I'm not for shopping. I'm for when life throws a flat tire at you. Feed me, then forget me.` } },
        { type: 'read', title: 'How much is enough?', html: `<p>A common guideline is <span class="hl">3 to 6 months of essential expenses</span>. Notice it says <strong>expenses</strong>, not income. You're measuring what it costs to keep your life running if your paycheck stopped.</p>
<p>Aim toward the higher end, or even beyond, if:</p>
<ul>
<li>Your income is irregular, like Ms. Ortiz with her bakery, or Dev with freelance gigs</li>
<li>You're the only earner in your household, or people depend on you</li>
<li>Your industry has frequent layoffs, or it would take a long time to find a new job</li>
<li>You have health issues or an older car that might need big repairs</li>
</ul>
<p>The lower end can work for someone with a very stable job, a second income in the household, and low fixed costs.</p>
<p>For a teen like Maya, living at home with few bills, a <strong>starter goal</strong> of a few hundred to $1,000 is a great first target. Covering a phone screen, a laptop repair or a surprise school cost without asking for help feels amazing.</p>` },
        { type: 'widget', name: 'emergency-fund', props: { monthlyExpenses: 2200 }, caption: 'Enter monthly essential expenses, starting with Leo\'s $2,200. See your 3-month and 6-month targets, and how long it takes to get there.' },
        { type: 'numeric', question: 'Leo\'s essential expenses are $2,000 a month. What is the 3-month emergency fund target?', answer: 6000, tolerance: 1, unit: '$', explain: '$2,000 x 3 = $6,000. A 6-month target would be $12,000.' },
        { type: 'read', title: 'What counts as essential?', html: `<p>To size your fund, add up only the costs you'd keep paying even in a tough month:</p>
<ul>
<li>Rent or mortgage</li>
<li>Utilities and phone</li>
<li>Groceries (not restaurants)</li>
<li>Insurance: health, car, renters</li>
<li>Transportation to work</li>
<li>Minimum payments on any debts</li>
</ul>
<p>Leave out the things you'd cut right away in a real emergency: eating out, streaming services, shopping, travel. That's why your emergency target can be smaller than your full monthly spending.</p>
<p>Example: Leo's full spending is about $2,900 a month, but his essentials (rent $1,100, groceries $350, car payment and insurance $400, utilities and phone $150) come to $2,000. His 3-month target is $6,000, not $8,700.</p>` },
        { type: 'check', question: 'Which of these is a true emergency-fund expense?', options: ['A limited-time sale on a TV', 'Concert tickets for a band you love', 'An urgent car repair needed to get to work', 'A planned vacation next summer'], answer: 2, explain: 'An emergency is unexpected, necessary and urgent. Sales, concerts and planned trips belong in your wants budget or a sinking fund.' },
        { type: 'read', title: 'Where to keep it', html: `<p>An emergency fund has one job: be there, in full, the moment you need it. So it should be:</p>
<ul>
<li><strong>Safe:</strong> no chance of losing value. An FDIC- or NCUA-insured account is ideal.</li>
<li><strong>Liquid:</strong> available within a day or two, without penalties.</li>
<li><strong>Separate:</strong> not sitting in checking, where it's easy to spend by accident.</li>
</ul>
<p>For most people, a <strong>high-yield savings account</strong> at an insured bank hits all three and earns interest too. Some people with larger funds keep part of it in T-bills or a no-penalty CD for a bit more yield, while keeping at least a month or two of expenses instantly available.</p>
<p>Where it should <em>not</em> go: stocks or crypto. Emergencies often come at the same time as market crashes. In 2008 and early 2020, layoffs spiked while stock prices plunged. Selling investments after a big drop to pay rent locks in the loss.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `The day you lose your job is often the day the market is down. Emergency money in stocks is a bet you don't want to make.` } },
        { type: 'read', title: 'Building it without burning out', html: `<p>Six months of expenses can feel impossible from zero. So don't start there. Build it in stages:</p>
<ol>
<li><strong>Starter fund:</strong> $500 to $1,000, or one month of essentials. This alone handles a lot of surprises.</li>
<li><strong>One month, then three months:</strong> keep going with automatic transfers on payday.</li>
<li><strong>Full target:</strong> 3 to 6 months, or more if your situation calls for it.</li>
</ol>
<p>Speed boosters: send windfalls like tax refunds, birthday money or bonuses straight to the fund. Sell stuff you don't use. Temporarily trim the wants budget.</p>
<p>If you also have high-interest credit card debt, a common approach is to build the starter fund first, then attack the debt hard, then come back to finish the full fund. Without that starter cushion, the next surprise just lands back on the card.</p>` },
        { type: 'read', title: 'The three-question test', html: `<p>Before tapping the fund, ask three questions:</p>
<ol>
<li><strong>Is it unexpected?</strong> Holiday gifts and car registration happen every year. Those belong in a sinking fund.</li>
<li><strong>Is it necessary?</strong> Will skipping it hurt your health, your job, your home or your safety?</li>
<li><strong>Is it urgent?</strong> Does it need to be handled now, not next month?</li>
</ol>
<p>Three yeses? Use the fund, guilt-free. That's what it's for.</p>
<p>Clear yeses: job loss, a medical or dental bill, an urgent car or home repair, a last-minute flight for a family emergency.</p>
<p>Clear nos: sales, concerts, a vacation, a new phone because yours is old but still works.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: `Running emergency check. Unexpected: yes. Necessary: yes. Urgent: yes. Withdrawal approved.` } },
        { type: 'match', prompt: 'Match each cost to where the money should come from.', pairs: [
          { left: 'Sudden layoff', right: 'Emergency fund' },
          { left: 'Car insurance due every 6 months', right: 'Sinking fund' },
          { left: 'Weekend concert tickets', right: 'Wants budget' },
          { left: 'Emergency room bill', right: 'Emergency fund' },
        ] },
        { type: 'truefalse', statement: 'An emergency fund should be invested in stocks so it grows faster.', answer: false, explain: 'Emergency money must be safe and available. Stocks can drop sharply, often right when job losses rise, which is exactly when you would need the cash.' },
        { type: 'read', title: 'Use it, then refill it', html: `<p>Using your emergency fund is not a failure. It's the plan working. But once the crisis passes, the next job is to <strong>refill</strong> it. Temporarily redirect money from other goals until the fund is back where it was.</p>
<p>Your fund also works with insurance. Health, car and renters insurance often have a <span class="term" data-def="The amount you pay yourself before insurance starts covering a claim.">deductible</span>, the amount you pay before insurance kicks in. Knowing your deductibles helps you size your fund. If your car insurance deductible is $1,000, your fund should at least cover that.</p>
<p>Business owners need two funds. Ms. Ortiz keeps a personal emergency fund and a separate business reserve for things like a broken oven or a slow winter. Mixing them is how one bad month at the bakery turns into a crisis at home.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: `Ms. Ortiz's oven died in January. Her business reserve paid for it. The croissants never stopped.` } },
        { type: 'quiz', questions: [
          { q: 'What is the common guideline for an emergency fund?', options: ['1 week of income', '3 to 6 months of essential expenses', '2 years of total spending', '10% of yearly income, invested in stocks'], answer: 1, explain: 'Three to six months of essential expenses is the common guideline, with more for irregular income or higher risk situations.' },
          { q: 'Where is an emergency fund usually best kept?', options: ['A high-yield savings account at an insured bank', 'A single growth stock', 'A 5-year CD with a big penalty', 'Crypto, for faster growth'], answer: 0, explain: 'It needs to be safe, liquid and separate. An insured high-yield savings account checks all three boxes.' },
          { q: 'Ms. Ortiz has irregular income from her bakery. How should that affect her emergency fund target?', options: ['She needs less, because she can raise prices', 'It makes no difference', 'She can skip it, because businesses get loans', 'She should aim toward the higher end or beyond'], answer: 3, explain: 'Irregular income makes surprise shortfalls more likely, so a bigger cushion makes sense.' },
          { q: 'Maya\'s laptop for school breaks and she needs a $300 repair this week. Which test does it pass?', options: ['Unexpected, necessary and urgent, so the emergency fund is a fair use', 'None, she should put it on a credit card', 'It is only a want', 'It belongs in her vacation fund'], answer: 0, explain: 'A broken laptop she needs for school is unexpected, necessary and urgent. That is exactly what the fund is for.' },
          { q: 'Leo\'s essential expenses are $2,500 a month. He has saved $5,000. How many months of essentials does that cover?', options: ['1 month', '3 months', '2 months', '5 months'], answer: 2, explain: '$5,000 / $2,500 = 2 months. He is past a starter fund and working toward 3 to 6 months.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 6
    {
      id: 'money-2-credit-scores',
      title: 'Credit Scores and Credit Cards',
      summary: 'What goes into your credit score, how utilization works, how teens can start building credit, and how to use a credit card without ever paying interest.',
      minutes: 15,
      icon: 'card',
      steps: [
        { type: 'read', title: 'Your financial report card', html: `<p>A <span class="term" data-def="A three-digit number that estimates how likely you are to repay borrowed money on time.">credit score</span> is a number lenders use to guess how likely you are to pay back money on time. The most widely used, FICO, runs from <strong>300 to 850</strong>. Higher is better.</p>
<p>Your score is calculated from your <span class="term" data-def="A record of your borrowing and payment history, kept by the credit bureaus.">credit report</span>, a record kept by three big credit bureaus: <strong>Equifax, Experian and TransUnion</strong>. It lists your cards and loans, your balances, and whether you've paid on time.</p>
<p>Who checks it? Lenders, obviously, for cards, car loans and mortgages. But also landlords deciding whether to rent to you, many insurance companies when setting prices (where state law allows), and sometimes phone and utility companies deciding whether you need a deposit.</p>
<p>A strong score can save serious money. On a car loan or mortgage, a better score often means a noticeably lower interest rate, which can add up to thousands of dollars over the life of the loan.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: `Fun fact: there are many score versions, like FICO and VantageScore. Your number can differ a bit depending on which one a lender uses.` } },
        { type: 'read', title: 'What goes into a FICO score', html: `<p>FICO publishes the general weights of what matters:</p>
<table>
<thead><tr><th>Factor</th><th>Weight</th><th>In plain English</th></tr></thead>
<tbody>
<tr><td>Payment history</td><td>about 35%</td><td>Do you pay on time?</td></tr>
<tr><td>Amounts owed</td><td>about 30%</td><td>How much of your available credit are you using?</td></tr>
<tr><td>Length of credit history</td><td>about 15%</td><td>How long have your accounts been open?</td></tr>
<tr><td>New credit</td><td>about 10%</td><td>Have you applied for lots of credit recently?</td></tr>
<tr><td>Credit mix</td><td>about 10%</td><td>Do you handle different types, like cards and installment loans?</td></tr>
</tbody></table>
<p>Notice the top two. Together, <strong>paying on time</strong> and <strong>not using too much of your limits</strong> make up about two-thirds of the score. You control both of those every single month.</p>
<p>Length of history is the one you can't rush. That's why starting early, carefully, is such a big advantage.</p>` },
        { type: 'order', prompt: 'Order these FICO factors from biggest weight to smallest.', items: ['Payment history', 'Amounts owed', 'Length of credit history'], explain: 'Payment history is about 35%, amounts owed about 30%, and length of history about 15%. New credit and credit mix are about 10% each.' },
        { type: 'read', title: 'Utilization: the sneaky one', html: `<p>The biggest part of "amounts owed" is your <span class="term" data-def="Your credit card balances divided by your total credit limits, shown as a percentage.">credit utilization</span>: your card balances divided by your credit limits.</p>
<p>If Maya has a $1,000 limit and a $300 balance, her utilization is 30%. Lower generally looks better. A common rule of thumb is to keep it under 30%, and people with the highest scores often keep it under 10%.</p>
<p>Here's the trick most people miss: card companies usually report your balance to the bureaus around your <strong>statement date</strong>, not your due date. So even if Maya pays in full every month, if her statement shows $800 on a $1,000 limit, the bureaus may see 80% utilization.</p>
<p>The fix: make a payment before the statement closes, or just keep spending well below the limit. Good news: utilization has no long-term memory in most scoring models. Bring it down and your score can bounce back within a month or two.</p>`,
          sprite: { who: 'chip', mood: 'wow', say: `Paying in full avoids interest. Paying before the statement closes can also lower the balance the bureaus see. Two different wins.` } },
        { type: 'numeric', question: 'Leo has two cards with a combined limit of $5,000 and combined balances of $750. What is his overall credit utilization?', answer: 15, tolerance: 0.1, unit: '%', explain: '$750 / $5,000 = 0.15, or 15%.' },
        { type: 'read', title: 'Starting credit as a teen', html: `<p>You can't build credit without credit, which feels unfair. Here are the common ways in:</p>
<ul>
<li><strong>Authorized user:</strong> a parent adds you to their card. You get your own card, but they own the account. Many issuers report the account to your credit report too, so years of their on-time payments can help you. Each issuer sets its own minimum age, and some have none. The catch: if they pay late or max it out, that can hurt you too.</li>
<li><strong>Your own card at 18+:</strong> under the <span class="term" data-def="A 2009 federal law that added protections for credit card users, including limits on cards for people under 21.">CARD Act</span> of 2009, if you're under 21 you must show you have <strong>independent income</strong> or ability to pay, or have a co-signer who is 21 or older. Many issuers no longer accept co-signers, so income from a job is the usual route.</li>
<li><strong>Student cards:</strong> made for people with little history, usually with low limits.</li>
<li><strong>Secured cards:</strong> you put down a deposit, often a few hundred dollars, which usually becomes your limit. Use it well and many issuers graduate you to a regular card.</li>
</ul>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Being an authorized user ties your credit to someone else's habits. Only do it with someone who pays on time, every time.` } },
        { type: 'check', question: 'Maya turns 19 and applies for her own credit card. Under the CARD Act, what does she need?', options: ['Nothing, anyone over 18 automatically qualifies', 'Proof of independent income or ability to pay, or a co-signer 21 or older', 'A credit score above 800', 'Permission from her high school'], answer: 1, explain: 'Applicants under 21 must show their own ability to pay, such as income from her café job, or have a qualifying co-signer if the issuer allows one.' },
        { type: 'read', title: 'How to never pay credit card interest', html: `<p>Credit cards can be a great tool or a trap. The difference is one habit: <strong>pay the full statement balance by the due date, every month.</strong></p>
<p>Most cards have a <span class="term" data-def="The time between the end of a billing cycle and the payment due date, when no interest is charged on new purchases if you paid in full last time.">grace period</span>: if you paid last month's balance in full, new purchases are interest-free until the due date. By law, card issuers must send your bill at least 21 days before the payment is due, giving you time to pay in full.</p>
<p>Carry a balance, even part of one, and you usually lose that grace period. Interest starts on new purchases right away until you pay in full again.</p>
<p>Two more traps:</p>
<ul>
<li><strong>Cash advances</strong> (using the card for cash) usually have no grace period, a higher APR and an upfront fee.</li>
<li><strong>Late payments</strong> can bring a late fee and possibly a higher penalty APR, and a payment 30 or more days late can be reported to the bureaus and stay on your report for up to 7 years.</li>
</ul>`,
          sprite: { who: 'penny', mood: 'happy', say: `Use the card like a debit card. Only buy what's already in your checking account, then autopay the full balance.` } },
        { type: 'truefalse', statement: 'Carrying a small balance from month to month helps your credit score more than paying in full.', answer: false, explain: 'This is a common myth. Paying in full builds the same on-time history without paying any interest. Carrying a balance only costs you money.' },
        { type: 'read', title: 'What hurts, what doesn\'t', html: `<p><strong>Things that hurt your score:</strong></p>
<ul>
<li>Payments 30+ days late, collections, and bankruptcies</li>
<li>Very high utilization</li>
<li>Applying for lots of new credit in a short time. Each application usually triggers a <span class="term" data-def="A credit check made when you apply for credit. It can lower your score a little for a while.">hard inquiry</span>, which can shave a few points for a while. Scoring models usually treat multiple car loan or mortgage applications within a short window as one shopping search.</li>
<li>Closing your oldest card, which can shrink your total limit and, over time, your average account age</li>
</ul>
<p><strong>Things that don't hurt:</strong></p>
<ul>
<li>Checking your own score or report. That's a <span class="term" data-def="A credit check that does not affect your score, like checking your own report or a preapproval offer.">soft inquiry</span>.</li>
<li>Your income, your bank balances and your debit card use. They aren't on your credit report.</li>
</ul>
<p>Check your reports for free at AnnualCreditReport.com, the official site. The three bureaus now offer free reports there weekly. Dispute anything that's wrong. You can also <strong>freeze</strong> your credit for free at each bureau, which blocks new accounts from being opened in your name.</p>` },
        { type: 'match', prompt: 'Match each term to its meaning.', pairs: [
          { left: 'Utilization', right: 'Balances divided by credit limits' },
          { left: 'Hard inquiry', right: 'Credit check from applying for a loan or card' },
          { left: 'Soft inquiry', right: 'Checking your own score, no impact' },
          { left: 'Authorized user', right: 'Someone added to another person\'s card account' },
          { left: 'Secured card', right: 'A card backed by a cash deposit' },
        ] },
        { type: 'callout', variant: 'tip', title: 'The five-habit credit plan', html: `<ol>
<li>Set autopay for the <strong>full statement balance</strong>.</li>
<li>Keep utilization low, ideally well under 30%.</li>
<li>Keep your oldest no-annual-fee card open and use it lightly so it stays active.</li>
<li>Apply for new credit only when you actually need it.</li>
<li>Freeze your credit at all three bureaus when you aren't applying for anything.</li>
</ol>` },
        { type: 'quiz', questions: [
          { q: 'Which factor has the biggest weight in a FICO score?', options: ['Credit mix', 'New credit', 'Length of history', 'Payment history'], answer: 3, explain: 'Payment history is about 35% of a FICO score, the largest single factor.' },
          { q: 'Dev has a $2,000 limit and a $1,600 statement balance, which he pays in full. What problem might show up on his credit?', options: ['High utilization of about 80%', 'A late payment mark', 'Interest charges', 'A hard inquiry'], answer: 0, explain: 'The statement balance is usually what gets reported. $1,600 / $2,000 is 80% utilization, even though he pays no interest.' },
          { q: 'How do you avoid paying interest on credit card purchases?', options: ['Pay the minimum on time', 'Pay the full statement balance by the due date each month', 'Use cash advances instead', 'Only use the card once a year'], answer: 1, explain: 'Paying in full keeps your grace period, so purchases never accrue interest.' },
          { q: 'Which of these does NOT affect your credit score?', options: ['Missing a payment by 45 days', 'Maxing out your cards', 'Checking your own credit report', 'Opening five new cards in a month'], answer: 2, explain: 'Checking your own report is a soft inquiry and has no effect on your score.' },
          { q: 'A 16-year-old wants to start building credit. Which option is usually available?', options: ['Becoming an authorized user on a parent\'s card, if the issuer allows it', 'Opening their own credit card alone', 'Taking out a mortgage', 'Getting a payday loan'], answer: 0, explain: 'Minors generally cannot open their own card, but many issuers allow authorized users, and many report that account to the user\'s credit file.' },
        ] },
      ],
    },
    // ---------------------------------------------------------------- Lesson 7
    {
      id: 'money-2-paychecks-and-taxes',
      title: 'Paychecks and Taxes 101',
      summary: 'Why your paycheck is smaller than your salary: gross vs net pay, withholding, the W-4, W-2 vs 1099, FICA, and how tax brackets really work.',
      minutes: 15,
      icon: 'receipt',
      steps: [
        { type: 'read', title: 'Where did my money go?', html: `<p>Leo's offer letter says <strong>$52,000 a year</strong>. He gets paid every two weeks, 26 times a year, so he expects $2,000 per paycheck. His first deposit is closer to <strong>$1,550</strong>. Did HR make a mistake?</p>
<p>Nope. Welcome to the difference between gross and net pay:</p>
<ul>
<li><span class="term" data-def="Your total pay before any taxes or deductions are taken out.">Gross pay</span> is the full amount you earned: $2,000.</li>
<li><span class="term" data-def="Your take-home pay after taxes and deductions. The amount that actually lands in your account.">Net pay</span> is what's left after taxes and deductions: the money that actually lands in your account.</li>
</ul>
<p>Your <strong>pay stub</strong> shows every slice that came out. Reading it once, line by line, is one of the most useful money skills there is. You'll catch mistakes, understand your taxes, and know exactly what you're working with when you budget.</p>
<p>(Exact take-home depends on your state, benefits and tax choices, so Leo's $1,550 is just an example.)</p>`,
          sprite: { who: 'chip', mood: 'wow', say: `The salary is the headline. The net pay is the real story. Always budget with net pay.` } },
        { type: 'read', title: 'The slices on a pay stub', html: `<p>Most paychecks lose money to some mix of these:</p>
<ul>
<li><strong>Federal income tax withholding:</strong> an estimate of the income tax you'll owe for the year, sent to the IRS a bit at a time.</li>
<li><strong>State and local income tax:</strong> depends where you live and work. Some states, like Texas and Florida, have no state income tax on wages.</li>
<li><strong>FICA:</strong> Social Security and Medicare taxes. More on these next.</li>
<li><strong>Pre-tax deductions:</strong> things like a traditional 401(k) contribution or your share of health insurance. These come out before income tax is figured, which can lower the income tax you owe.</li>
<li><strong>After-tax deductions:</strong> things like Roth 401(k) contributions, which come out after taxes.</li>
</ul>
<p>Some of those slices are still your money, like retirement savings. Some pay for benefits you use, like health insurance. And some are taxes that fund roads, schools, the military, and programs like Social Security.</p>` },
        { type: 'read', title: 'FICA: Social Security and Medicare', html: `<p><span class="term" data-def="Federal Insurance Contributions Act. The payroll taxes that fund Social Security and Medicare.">FICA</span> taxes fund two big federal programs:</p>
<ul>
<li><strong>Social Security: 6.2%</strong> of your wages, up to a yearly earnings cap. The cap rises most years, so check the current number on the Social Security Administration's website.</li>
<li><strong>Medicare: 1.45%</strong> of all wages, with no cap. Very high earners pay an extra 0.9% on wages above a set threshold.</li>
</ul>
<p>Together that's <span class="hl">7.65%</span> for most employees. On Leo's $2,000 paycheck, FICA is $153.</p>
<p>Your employer pays a matching 7.65% on top of your wages, so the total going in is 15.3%. If you're <strong>self-employed</strong>, you pay both halves yourself, which is called self-employment tax.</p>
<p>One key difference from income tax: FICA is usually withheld even if you earn very little. Maya's café paycheck has FICA taken out even if she ends up owing zero federal income tax for the year.</p>` },
        { type: 'numeric', question: 'Maya earns $600 gross in a pay period. How much FICA is withheld at 7.65%?', answer: 45.9, tolerance: 0.01, unit: '$', explain: '$600 x 0.0765 = $45.90. That is $37.20 for Social Security and $8.70 for Medicare.' },
        { type: 'read', title: 'The W-4: telling your boss how much to withhold', html: `<p>When you start a job, you fill out a <span class="term" data-def="The IRS form you give your employer to tell it how much federal income tax to withhold from your pay.">W-4</span>. It tells your employer how much federal income tax to take out of each paycheck. The form was redesigned in 2020 and no longer uses "allowances." A single person with one job and no dependents can usually just fill in the basics and sign.</p>
<p>Withholding is an estimate, so it rarely matches your actual tax exactly:</p>
<ul>
<li><strong>Too much withheld:</strong> you get a <strong>refund</strong> after filing. That's not a bonus. It's your own money, returned without interest.</li>
<li><strong>Too little withheld:</strong> you owe money at tax time, and if it's a lot, possibly a penalty.</li>
</ul>
<p>Teens sometimes qualify to write "exempt" on the W-4. That's allowed only if you owed no federal income tax last year and expect to owe none this year. Even then, FICA still comes out. You can submit a new W-4 any time your life changes, like a second job or a big raise.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: `Big refund means you over-withheld all year. Big bill means you under-withheld. Goal: land close to zero.` } },
        { type: 'read', title: 'W-2 vs 1099: employee or contractor?', html: `<p>How you're paid changes how you're taxed.</p>
<p><strong>W-2 employees</strong> (like Leo and Maya) have taxes withheld from every paycheck. In January, the employer sends a <span class="term" data-def="A yearly form from your employer showing your wages and the taxes withheld.">W-2</span> form summarizing your pay and withholding for the year, which you use to file your taxes.</p>
<p><strong>Independent contractors</strong> (like Dev's freelance design gigs, or many delivery and rideshare drivers) are paid their full amount with <strong>nothing withheld</strong>. Clients may send a <span class="term" data-def="A tax form reporting payments to an independent contractor. No taxes were withheld.">1099-NEC</span>, and payment apps may send a 1099-K. Even if you don't get a form, the income is still taxable.</p>
<p>Contractors are responsible for:</p>
<ul>
<li>Income tax on their profit</li>
<li>Self-employment tax, roughly 15.3% on most of their net earnings, covering both halves of Social Security and Medicare</li>
<li>Usually, paying estimated taxes during the year, often quarterly</li>
</ul>
<p>Contractors can deduct legitimate business expenses, which lowers their taxable profit. But they need to set money aside from every payment.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: `Dev spent every dollar from his gigs. Then April came. Rule of thumb: set aside a chunk, often 25% to 30%, of contractor income for taxes.` } },
        { type: 'match', prompt: 'Match each tax term to its meaning.', pairs: [
          { left: 'W-4', right: 'Form telling your employer how much income tax to withhold' },
          { left: 'W-2', right: 'Year-end summary of an employee\'s wages and withholding' },
          { left: '1099-NEC', right: 'Form reporting contractor pay with no withholding' },
          { left: 'FICA', right: 'Social Security and Medicare payroll taxes' },
          { left: 'Net pay', right: 'What actually lands in your account' },
        ] },
        { type: 'read', title: 'How tax brackets really work', html: `<p>The US federal income tax is <span class="term" data-def="A tax system where higher slices of income are taxed at higher rates.">progressive</span>: higher slices of income are taxed at higher rates. Real federal brackets run from 10% to 37%, and the dollar amounts change every year, so check the IRS website for current numbers.</p>
<p>To keep the math easy, here's a <strong>simplified, made-up</strong> bracket system. These are not the real IRS numbers:</p>
<table>
<thead><tr><th>Taxable income slice</th><th>Rate</th></tr></thead>
<tbody>
<tr><td>First $10,000</td><td>10%</td></tr>
<tr><td>$10,001 to $40,000</td><td>15%</td></tr>
<tr><td>Above $40,000</td><td>25%</td></tr>
</tbody></table>
<p>Leo has $50,000 of taxable income (after deductions like the standard deduction). Each slice gets its own rate:</p>
<ul>
<li>First $10,000 x 10% = $1,000</li>
<li>Next $30,000 x 15% = $4,500</li>
<li>Last $10,000 x 25% = $2,500</li>
</ul>
<p>Total tax: <strong>$8,000</strong>. His <span class="term" data-def="The tax rate on your next dollar of income, the rate of your highest bracket.">marginal rate</span> is 25%, the rate on his top slice. His <span class="term" data-def="Your total tax divided by your income: the average rate you actually pay.">effective rate</span> is $8,000 / $50,000 = 16%.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: `Brackets are like buckets filling in order. Only the water in the top bucket gets the top rate.` } },
        { type: 'numeric', question: 'Using the made-up brackets, Maya has $20,000 of taxable income. First $10,000 at 10%, next $10,000 at 15%. What is her effective tax rate?', answer: 12.5, tolerance: 0.1, unit: '%', explain: 'Tax is $1,000 + $1,500 = $2,500. $2,500 / $20,000 = 12.5%. Her marginal rate is 15%, but her effective rate is lower.' },
        { type: 'check', question: 'Using the made-up brackets, Leo gets a raise from $50,000 to $51,000 of taxable income. How much more tax does he owe?', options: ['$250, since only the extra $1,000 is taxed at 25%', '$12,750, since all his income is now taxed at 25%', '$0, raises are not taxed', '$1,000'], answer: 0, explain: 'Only the new $1,000 lands in the 25% slice: $1,000 x 25% = $250. A raise never makes your total take-home pay smaller because of brackets.' },
        { type: 'callout', variant: 'myth', title: 'Myth: a raise can push you into a higher bracket and shrink your pay', html: `<p>You'll hear people say "don't take that raise, it'll bump you into a higher bracket." Brackets don't work that way. Moving into a higher bracket only raises the rate on the dollars <em>inside</em> that new bracket. Every dollar below it is taxed exactly as before. More gross pay always means more income after federal income tax.</p>` },
        { type: 'truefalse', statement: 'A big tax refund means the government gave you free money.', answer: false, explain: 'A refund is your own money that was over-withheld during the year, returned without interest. Adjusting your W-4 can put that money in your paychecks instead.' },
        { type: 'callout', variant: 'tip', title: 'Filing your first return', html: `<p>Federal tax returns are usually due around <strong>April 15</strong> for the previous year. Many teens and young adults with small incomes are not required to file, but should file anyway if income tax was withheld, because filing is the only way to get that withholding refunded. Many people can file for free through the IRS Free File program. Keep your W-2s and 1099s in one folder each January.</p>` },
        { type: 'quiz', questions: [
          { q: 'What is the difference between gross and net pay?', options: ['Gross is after taxes, net is before', 'Gross is before taxes and deductions, net is what you take home', 'They are the same thing', 'Net includes your employer\'s FICA match'], answer: 1, explain: 'Gross pay is the full amount earned. Net pay is what lands in your account after taxes and deductions.' },
          { q: 'What is the total FICA rate withheld from most employees\' pay?', options: ['6.2%', '1.45%', '15.3%', '7.65%'], answer: 3, explain: '6.2% Social Security plus 1.45% Medicare equals 7.65%. Employers pay a matching 7.65%, and the self-employed pay both halves, 15.3%.' },
          { q: 'Dev earns $8,000 from freelance gigs and receives 1099 forms. What is true?', options: ['No taxes were withheld, so he may owe income tax and self-employment tax', 'His clients already paid all his taxes', 'Freelance income under $10,000 is never taxed', 'He only owes FICA at 7.65%'], answer: 0, explain: 'Contractors have nothing withheld. They owe income tax on profit plus self-employment tax covering both halves of Social Security and Medicare.' },
          { q: 'Using the lesson\'s made-up brackets, someone with $40,000 of taxable income owes $5,500. What is their effective rate?', options: ['10%', '15%', 'About 13.75%', '25%'], answer: 2, explain: '$5,500 / $40,000 = 13.75%. Their marginal rate is 15%, but the effective rate averages all slices together.' },
          { q: 'Leo got a $2,400 refund. What does that most likely mean?', options: ['He paid too little tax during the year', 'Too much was withheld from his paychecks during the year', 'He received a government bonus', 'His employer made a mistake on his W-2'], answer: 1, explain: 'A refund means withholding was higher than his actual tax. He could adjust his W-4 to keep more in each paycheck.' },
        ] },
      ],
    },
  ],
  bossQuestions: [
    { q: 'Ms. Ortiz has $300,000 in a single-owner savings account at one FDIC-insured bank, plus $100,000 in a money market fund at her brokerage. Which is TRUE?', options: ['All $400,000 is FDIC insured', '$50,000 of her bank savings is above the FDIC limit, and the money market fund is not FDIC insured at all', 'Only the money market fund is insured, by the FDIC', 'Nothing is insured because she owns a business'], answer: 1, explain: 'Her single ownership category at one bank is covered up to $250,000, leaving $50,000 uninsured. A money market fund is an investment, not a deposit. SIPC only helps if the brokerage fails and assets are missing.' },
    { q: 'Leo wants a 3-month emergency fund. His essentials are $2,200 a month. Which plan is BEST?', options: ['$6,600 in an index fund for faster growth', '$6,600 in a 5-year CD with a 12-month interest penalty', '$6,600 in a high-yield savings account at an FDIC-insured bank, separate from checking', '$6,600 kept in a payment app balance whose partner bank he has never checked'], answer: 2, explain: 'An emergency fund must be safe, liquid and separate. Stocks can crash when jobs are lost, a long CD locks up access, and app balances may not be protected the same way as insured bank deposits.' },
    { q: 'Maya has a $1,000 card limit. Her statement balance is $850 each month and she pays it in full by the due date. What is happening?', options: ['She pays no interest, but the reported utilization of about 85% may be holding her score down', 'She pays interest every month and has low utilization', 'Her score cannot be affected because she pays in full', 'She is building a late payment history'], answer: 0, explain: 'Paying in full keeps her grace period, so no interest. But the statement balance is usually what gets reported, so utilization looks like 85%. Paying before the statement closes, or spending less, would help.' },
    { q: 'Leo earns a $2,000 gross biweekly paycheck. FICA is 7.65%. He wants to budget his savings with the 50/30/20 rule. What should he base the 20% on?', options: ['His $2,000 gross pay', 'His $153 FICA amount', 'His employer\'s FICA match', 'His net pay, the amount that actually lands in his account'], answer: 3, explain: 'FICA alone is $153, and income taxes and deductions come out too. 50/30/20 uses after-tax take-home pay, because that is the money he can actually spend or save.' },
    { q: 'Using made-up brackets of 10% on the first $10,000, 15% up to $40,000 and 25% above, Dev has $60,000 of taxable income. What are his marginal and effective rates?', options: ['25% marginal and 25% effective', '15% marginal and about 19% effective', '25% marginal and about 17.5% effective', '10% marginal and about 17.5% effective'], answer: 2, explain: 'Tax is $1,000 + $4,500 + $5,000 (25% of $20,000) = $10,500. His top slice is taxed at 25% (marginal). $10,500 / $60,000 = 17.5% effective.' },
  ],
};
