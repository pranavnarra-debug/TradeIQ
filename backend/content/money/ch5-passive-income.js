// Unit 1 "Money Moves", chapter 5: Passive Income, For Real.
// Rates, tax brackets and limits in this chapter are illustrative unless stated as rules.
export default {
  id: 'money-ch5',
  title: 'Passive Income, For Real',
  blurb: 'What "passive income" actually takes: interest, bonds, dividends, REITs, index funds, taxes, and the scams that hide behind the phrase.',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'money-5-what-passive-really-means',
      title: 'What "Passive" Really Means',
      summary: 'The honest version of passive income: it runs on money or on work you already did, and the math is humbling.',
      minutes: 12,
      icon: 'lightbulb',
      steps: [
        { type: 'read', title: 'The dream on your feed', html: `<p>Scroll for ten minutes and someone will tell you they make <strong>$10,000 a month while they sleep</strong>. They are usually posing next to a rented car, and the link in their bio sells a course.</p>
<p>Here is the real definition. <span class="term" data-def="Money that keeps arriving without you trading fresh hours for it each time, like interest, dividends, rent or royalties.">Passive income</span> is money that shows up without you clocking in for it each time. Interest from a savings account. Dividends from a stock fund. Rent from a property. Royalties from a song you wrote years ago.</p>
<p>That definition is real, and it is worth chasing. But notice what every example has in common: <span class="hl">something had to exist first</span>. Money in the account. Shares in the fund. A building. A finished song. Passive income is the harvest, not the seed.</p>
<p>This chapter is about doing it for real: what actually pays you, how much it pays, what can go wrong, what the tax bill looks like, and how to spot the people selling a fantasy.</p>`,
          sprite: { who: 'grizz', mood: 'think', say: "Anyone earning $10k a month while they sleep does not need to sell you a $997 course. Just saying." } },
        { type: 'callout', variant: 'myth', title: 'Myth: passive means effortless', html: `<p>"Passive" describes how the money <em>arrives</em>, not how it was built. A landlord collects rent passively and then spends a Saturday fixing a leaking toilet. A YouTuber earns ad money from old videos only because they filmed hundreds of them. Almost nothing pays forever with zero effort, zero money and zero risk. If something claims all three, it is selling you something.</p>` },
        { type: 'read', title: 'Two engines: capital or upfront work', html: `<p>Every legit passive income stream runs on one of two engines.</p>
<p><strong>Engine 1: capital.</strong> You put money to work and it earns a return. Savings interest, bonds, dividends, REITs, index funds. The effort is low, but you need the money first, and you take on some risk that the return shrinks or the value drops.</p>
<p><strong>Engine 2: upfront work.</strong> You build something once and it keeps selling. A how-to ebook, a stock-photo library, a phone app, a course you actually know how to teach. Nobody pays you for the hours as you spend them, and most of these projects earn little or nothing. The few that work usually need ongoing updates, marketing and customer emails.</p>
<p>Most people do best by starting with Engine 1, because it is boring, it scales, and it does not require a viral hit. The rest of this chapter mostly lives there.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "Economists call Engine 1 'portfolio income.' I call it money doing a shift so you do not have to." } },
        { type: 'callout', variant: 'example', title: "Ms. Ortiz's cookbook", html: `<p>Ms. Ortiz spent eight months of evenings writing a cookbook of her bakery's best recipes and selling it as a download. Year one it earned about $1,800. Year two, about $600, because she stopped promoting it. That is Engine 2 in real life: the upfront work was huge, the income was real, and it faded without fresh effort. Still nice. Not a retirement plan.</p>` },
        { type: 'cards', title: 'Words to know', cards: [
          { front: 'Passive income', back: 'Money that keeps arriving without trading new hours for it each time.' },
          { front: 'Active income', back: 'Pay for time and effort right now: wages, tips, freelance gigs.' },
          { front: 'Capital', back: 'Money you have saved and put to work so it can earn more money.' },
          { front: 'Yield', back: 'The income an investment pays per year, shown as a percent of what it costs.' },
          { front: 'Principal', back: 'The original amount you put in, before any interest or growth.' },
        ] },
        { type: 'check', question: 'Which of these is closest to truly passive income?', options: ['Interest from money already sitting in a savings account', 'Driving for a delivery app on weekends', 'Reselling sneakers you buy at drops', 'Tutoring a classmate every Tuesday'], answer: 0, explain: 'Once the money is deposited, interest arrives with no new hours. The other three only pay while you keep working, which makes them active income, even if the hours are flexible.' },
        { type: 'read', title: 'The honest math', html: `<p>Say you want <strong>$100 a month</strong>, which is $1,200 a year. How much money has to be working for you? Divide the yearly income by the yield.</p>
<table><thead><tr><th>Yield per year</th><th>Money needed for $100/month</th></tr></thead><tbody>
<tr><td>1%</td><td>$120,000</td></tr>
<tr><td>2%</td><td>$60,000</td></tr>
<tr><td>4%</td><td>$30,000</td></tr>
<tr><td>5%</td><td>$24,000</td></tr>
<tr><td>8%</td><td>$15,000</td></tr>
</tbody></table>
<p>That is <em>before</em> taxes. Read the table twice. A hundred bucks a month, roughly a phone bill and a few lunches, takes tens of thousands of dollars at normal yields.</p>
<p>You might look at the 8% row and think "easy, just find higher yields." Hold that thought. Higher yields almost always come with higher risk. You will see why in the bonds and dividends lessons.</p>` },
        { type: 'numeric', question: 'At a 4% yield, how much money do you need invested to earn $250 a month before taxes?', answer: 75000, tolerance: 1, unit: '$', explain: '$250 x 12 = $3,000 a year. $3,000 / 0.04 = $75,000.' },
        { type: 'callout', variant: 'warn', title: 'Yield is a dial that comes with a warning label', html: `<p>Safe-ish places like savings accounts and Treasury bills pay whatever current interest rates allow. To get a lot more, someone has to take more risk: a company that might default, a stock whose dividend might get cut, a property that might sit empty. When a pitch offers a high yield <em>and</em> calls it safe, at least one of those words is wrong.</p>` },
        { type: 'read', title: 'Active income funds passive income', html: `<p>Here is the part the gurus skip. For almost everyone, <span class="hl">the first dollars of passive income come from a paycheck</span>.</p>
<p>Maya works at a café. She saves <strong>$200 a month</strong> and puts it somewhere earning about 4% a year. After ten years of steady deposits she has about <strong>$29,450</strong>, of which $24,000 came from her own paychecks and the rest from interest. At 4%, that pile now throws off close to <strong>$100 a month</strong>.</p>
<p>Is that life-changing? Not yet. But it is a real, growing engine, and her job built it. If she raises her savings as her pay grows, the engine grows faster. Leo, with his first salaried job, can save more per month, so his engine starts bigger.</p>
<p>The lesson: your income is your most powerful tool early on. Boosting what you earn and what you save moves the needle far more than hunting for an extra 1% of yield.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: "Every deposit is a tiny employee you hire. They never call in sick, but they do work slowly at first." } },
        { type: 'truefalse', statement: 'If a passive income source pays a higher yield, it is usually a better deal with no extra catch.', answer: false, explain: 'Higher yield is almost always payment for taking more risk: default, price drops, dividend cuts, vacancies or a lack of liquidity. Sometimes the risk is worth it, but there is always a catch.' },
        { type: 'order', prompt: 'Put these steps for building a passive income engine in a sensible order.', items: ['Earn active income from a job or business', 'Build a budget and spend less than you earn', 'Set aside an emergency fund', 'Invest the surplus regularly', 'Reinvest the income so it compounds'], explain: 'The paycheck comes first, the budget creates the surplus, the emergency fund keeps you from selling investments in a crisis, then investing and reinvesting do the long, slow work.' },
        { type: 'read', title: 'What is coming in this chapter', html: `<p>Here is the map for the rest of this chapter:</p>
<ul>
<li><strong>Interest income:</strong> savings accounts, CDs, T-bills and I bonds.</li>
<li><strong>Bonds:</strong> lending to governments and companies, and why prices move.</li>
<li><strong>Dividends:</strong> companies sharing profits, and the yield trap.</li>
<li><strong>REITs and real estate:</strong> rent income with or without the toilet repairs.</li>
<li><strong>Index investing:</strong> the 4% rule and how big a portfolio really needs to be.</li>
<li><strong>Taxes:</strong> because the government wants a cut of your passive income too.</li>
<li><strong>Scams:</strong> the people who use the words "passive income" to empty your wallet.</li>
</ul>
<p>Dev, our friend who day-trades too much, calls his trading "passive income." It is not. Staring at five charts for six hours is the least passive thing a person can do. We will come back to Dev.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Boring money that shows up every month beats exciting money that shows up never." } },
        { type: 'quiz', questions: [
          { q: 'What do nearly all real passive income sources need first?', options: ['A large social media following', 'A paid mentorship program', 'Money invested or work done upfront', 'A trading account with margin'], answer: 2, explain: 'Passive income is the harvest. Capital or upfront work is the seed.' },
          { q: 'At a 5% yield, how much must be invested to earn $100 a month before taxes?', options: ['$12,000', '$24,000', '$50,000', '$5,000'], answer: 1, explain: '$1,200 a year / 0.05 = $24,000.' },
          { q: 'Dev spends six hours a day watching charts and calls it passive income. What is it really?', options: ['Active income, because it requires his time and attention', 'Passive income, because no boss is involved', 'Interest income', 'Dividend income'], answer: 0, explain: 'If the money depends on your ongoing hours and decisions, it is active, no matter where you do it from.' },
          { q: 'A stranger offers "a safe 15% yearly yield, totally passive." What is the most reasonable reaction?', options: ['Accept, since 15% beats a savings account', 'Ask for a bigger percentage', 'Accept only if they have many followers', 'Be suspicious, since high yield and safety rarely come together'], answer: 3, explain: 'Higher yield is payment for risk. A pitch claiming high yield plus safety is a classic red flag.' },
          { q: 'Early in life, what usually grows a passive income engine the fastest?', options: ['Finding an extra 0.5% of yield', 'Raising how much you earn and save each month', 'Switching accounts every month', 'Buying a passive income course'], answer: 1, explain: 'With a small balance, extra yield adds only a few dollars. Bigger deposits from your paycheck do far more.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'money-5-interest-income',
      title: 'Getting Paid to Wait: Interest Income',
      summary: 'High-yield savings, CD ladders, Treasury bills and I bonds: the lowest-drama ways to earn passive income.',
      minutes: 14,
      icon: 'bank',
      steps: [
        { type: 'read', title: 'Renting out your money', html: `<p>When you put cash in a bank or lend it to the government, you are renting your money to someone else. The rent they pay you is <span class="term" data-def="The price someone pays to use your money for a while, usually shown as a yearly percentage.">interest</span>.</p>
<p>Interest income is the gentlest form of passive income. No stock charts, no tenants, no drama. The trade-off is that it rarely makes anyone rich. Its job is to keep your savings from sitting still while you wait for a goal: a car, college, an emergency fund, a down payment.</p>
<p>One big rule shapes everything in this lesson: <span class="hl">the rates on savings, CDs and T-bills move with the Federal Reserve</span>. When the Fed raises its target rate, these yields tend to climb. When it cuts, they slide. In just the last several years, savings rates have swung from well under 1% to around 5% and back down somewhat. So every rate in this lesson is <strong>illustrative</strong>. Always check today's numbers before you choose.</p>`,
          sprite: { who: 'penny', mood: 'happy', say: "Interest is the only rent you can collect without owning a building. I collect it from my own belly." } },
        { type: 'diagram', name: 'fed-rates', caption: 'Follow the arrows: when the Fed moves its target rate, bank savings rates, CD rates and T-bill yields tend to follow, usually within weeks or months.' },
        { type: 'read', title: 'High-yield savings accounts', html: `<p>A <span class="term" data-def="A savings account, often at an online bank, that pays a much higher interest rate than a typical big-bank savings account.">high-yield savings account</span> (HYSA) is a regular savings account that simply pays more, often because it is run by an online bank with no branches to pay for.</p>
<ul>
<li><strong>Access:</strong> you can move money out anytime, usually within a business day or two.</li>
<li><strong>Rate:</strong> variable. The bank can change it whenever it wants, and it usually follows the Fed.</li>
<li><strong>Safety:</strong> at an FDIC-insured bank, deposits are insured up to <strong>$250,000 per depositor, per bank, per ownership category</strong>. Credit unions have similar coverage through the NCUA.</li>
</ul>
<p>Example with an illustrative 4% rate: Maya keeps a $3,000 emergency fund in an HYSA. Over a year that earns roughly <strong>$120</strong>. A typical big-bank savings account paying a tiny fraction of a percent would earn her a few dollars at most. Same money, same safety, very different rent.</p>` },
        { type: 'callout', variant: 'warn', title: 'An app is not always a bank', html: `<p>Some money apps advertise high savings rates but are not banks themselves. They pass your money to partner banks. If the app or a middle company in between fails and the records are a mess, getting your money back can take a long time, which actually happened to customers of several fintech apps in 2024. Check that the account says your deposits are held at a named FDIC-insured bank, and read who actually holds the money.</p>` },
        { type: 'read', title: 'CDs and the CD ladder', html: `<p>A <span class="term" data-def="Certificate of deposit: you agree to leave money at a bank for a set term in exchange for a locked-in interest rate.">CD</span> (certificate of deposit) is a deal with a bank: you leave the money untouched for a set term, like 6 months or 3 years, and the bank locks your rate. Pull it out early and you usually pay an <strong>early withdrawal penalty</strong>, often a few months of interest.</p>
<p>The problem: if you lock everything into a 5-year CD, the money is stuck. If you only use 1-year CDs, you are always exposed to rates falling. The fix is a <span class="hl">CD ladder</span>.</p>
<p>Leo has $4,000. He puts $1,000 each into 1-year, 2-year, 3-year and 4-year CDs. Every year, one CD matures. He can use that cash, or roll it into a new 4-year CD at the top of the ladder. After a few years, every rung is a 4-year CD, usually the higher-paying kind, yet one still matures every single year.</p>
<p>A ladder trades a bit of flexibility for steadier, more predictable interest.</p>` },
        { type: 'order', prompt: 'Put the steps of building and running a CD ladder in order.', items: ['Split the money into equal chunks', 'Buy CDs with staggered terms, like 1, 2, 3 and 4 years', 'Wait for the shortest CD to mature', 'Use the cash or reinvest it in a new longest-term CD', 'Repeat each year so one rung always matures soon'], explain: 'Staggering the terms means something matures regularly. Rolling each maturing rung to the top keeps the ladder going.' },
        { type: 'read', title: 'Treasury bills: lending to Uncle Sam', html: `<p>A <span class="term" data-def="A short-term US government debt that matures in one year or less, sold below face value and repaid at full face value.">Treasury bill</span> (T-bill) is a short loan to the US government, lasting from a few weeks up to one year. T-bills do not send you interest checks. Instead, you buy them at a <strong>discount</strong> and get the full face value back at maturity. The difference is your interest.</p>
<p>Example: you pay <strong>$9,800</strong> for a 52-week bill with a $10,000 face value. A year later you receive $10,000. You earned $200.</p>
<p>Why people like them:</p>
<ul>
<li>Backed by the full faith and credit of the US government, which is considered about as safe as it gets for US dollars.</li>
<li>Interest is <strong>exempt from state and local income tax</strong>, which matters in high-tax states.</li>
<li>You can buy them directly at TreasuryDirect in $100 increments, or through most brokerages.</li>
</ul>
<p>Short maturities also mean you are not locked in long if rates rise.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "The government auctions T-bills every week. The auction sets the discount, so the price reflects current rates, not a bank's mood." } },
        { type: 'numeric', question: 'You pay $9,800 for a T-bill that pays $10,000 in one year. What is your return as a percent of what you paid? Round to two decimals.', answer: 2.04, tolerance: 0.05, unit: '%', explain: 'You earned $200 on $9,800. $200 / $9,800 = about 2.04%. Note it is slightly more than 2%, because you only paid $9,800, not $10,000.' },
        { type: 'read', title: 'I bonds: inflation-protected savings', html: `<p><span class="term" data-def="A US savings bond whose rate combines a fixed rate with an inflation rate that resets every six months.">I bonds</span> are US savings bonds built to keep up with inflation. Their rate has two parts:</p>
<ul>
<li>a <strong>fixed rate</strong> that stays the same for the life of the bond, and</li>
<li>an <strong>inflation rate</strong> that resets every six months (new rates are announced each May and November) based on the CPI.</li>
</ul>
<p>The combined rate cannot go below zero, so you will not lose dollars in a deflation year. The rules that matter:</p>
<ul>
<li>You can buy up to <span class="hl">$10,000 in electronic I bonds per person per calendar year</span>, through TreasuryDirect.</li>
<li>You must hold them for <strong>at least 12 months</strong>. No exceptions for regular cases.</li>
<li>If you cash out before <strong>5 years</strong>, you lose the last <strong>3 months of interest</strong>.</li>
<li>Interest is exempt from state and local tax, and federal tax can be deferred until you cash out.</li>
</ul>
<p>I bonds shine when inflation is high. When inflation cools, their rate falls too, so compare them with current T-bill and CD rates.</p>` },
        { type: 'truefalse', statement: 'You can cash out an I bond after six months if you accept a small penalty.', answer: false, explain: 'I bonds cannot be redeemed at all in the first 12 months. After that, cashing out before 5 years costs the last 3 months of interest.' },
        { type: 'match', prompt: 'Match each interest product to its key feature.', pairs: [
          { left: 'High-yield savings', right: 'Withdraw anytime, but the rate can change anytime' },
          { left: 'CD', right: 'Locked rate for a set term, penalty for early withdrawal' },
          { left: 'Treasury bill', right: 'Bought at a discount, matures in one year or less' },
          { left: 'I bond', right: 'Rate tracks inflation, must hold at least 12 months' },
        ] },
        { type: 'read', title: 'The real return: after taxes and inflation', html: `<p>Interest feels like free money, but two forces nibble at it.</p>
<p><strong>Taxes.</strong> Interest from savings and CDs is taxed as ordinary income. With an illustrative 4% rate and a 22% tax bracket, you keep about <strong>3.1%</strong>.</p>
<p><strong>Inflation.</strong> If prices rise 3% that year, your buying power grew by only around <strong>0.1%</strong>.</p>
<p>That is not a reason to skip interest income. Earning something is much better than earning nothing while inflation eats your cash. But it explains why interest income is usually a <em>parking spot</em> for short-term money and emergency funds, not the engine people use to grow wealth over decades. For long-term growth, people usually turn to stocks and funds, which come later in this chapter.</p>
<p>Numbers above are illustrative. Your bracket, the rate and inflation will all be different, so redo the math with real figures.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A 4% rate with 3% inflation is not 4% richer. It is barely richer. Do the math before you celebrate." } },
        { type: 'check', question: 'Maya will need her money in 9 months for a car, and she wants zero chance of losing principal. Which choice fits best?', options: ['A fund of long-term corporate bonds', 'A high-yield savings account or a T-bill that matures before she needs the money', 'An I bond', 'A single dividend stock'], answer: 1, explain: 'Short goals call for short, stable options. An I bond is locked for 12 months, and bonds and stocks can drop in price right when she needs to sell.' },
        { type: 'quiz', questions: [
          { q: 'Why do savings, CD and T-bill rates change over time?', options: ['Banks pick them at random', 'They are set by Congress each year', 'They tend to follow the Federal Reserve and market interest rates', 'They are fixed by law at 5%'], answer: 2, explain: 'These rates track the Fed and the broader market for short-term borrowing, which is why any specific number goes stale fast.' },
          { q: 'What is the per-person annual purchase limit for electronic I bonds through TreasuryDirect?', options: ['$5,000', '$25,000', 'No limit', '$10,000'], answer: 3, explain: 'The electronic limit is $10,000 per person per calendar year.' },
          { q: 'Leo cashes in an I bond after 3 years. What happens?', options: ['He loses the last 3 months of interest', 'He cannot cash it out until 5 years', 'He loses all interest earned', 'Nothing, there is no penalty after 1 year'], answer: 0, explain: 'After the 12-month minimum, redeeming before 5 years costs the last 3 months of interest.' },
          { q: 'What is the main purpose of a CD ladder?', options: ['To avoid all taxes on interest', 'To get FDIC coverage above $250,000 at one bank', 'To trade CDs for a profit', 'To have CDs maturing regularly while still earning longer-term rates'], answer: 3, explain: 'Staggered maturities give you regular access to cash and reduce the risk of locking everything in at one rate.' },
          { q: 'Ms. Ortiz lives in a state with a high income tax. Which interest is exempt from her state income tax?', options: ['Interest from Treasury bills', 'Interest from a bank CD', 'Interest from a high-yield savings account', 'Interest from a corporate bond'], answer: 0, explain: 'Interest on US Treasury securities is exempt from state and local income tax. Bank interest and corporate bond interest are not.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'money-5-bonds-101',
      title: 'Bonds 101: The IOU That Pays You',
      summary: 'Coupons, maturity, yield, ratings and the seesaw that makes bond prices fall when rates rise.',
      minutes: 15,
      icon: 'scale',
      steps: [
        { type: 'read', title: 'A bond is a fancy IOU', html: `<p>When a government or company needs to borrow a lot of money, it does not just call one bank. It sells <span class="term" data-def="A loan you make to a government or company. They pay you interest and return your money on a set date.">bonds</span>: small slices of a big loan that investors like you can buy.</p>
<p>Here is a typical deal. A company sells a bond with a <strong>face value</strong> of $1,000, a <strong>coupon</strong> of 5%, and a <strong>maturity</strong> of 10 years. That means:</p>
<ul>
<li>You lend $1,000.</li>
<li>Every year for 10 years, you get 5% of $1,000, which is $50. Most US bonds pay it in two $25 installments, every six months.</li>
<li>At the end of year 10, you get your $1,000 back.</li>
</ul>
<p>That stream of coupons is passive income. You do not need to do anything but hold the bond and hope the borrower stays able to pay. That last part is doing a lot of work, and we will come back to it.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "The word 'coupon' is from paper bonds. Owners literally clipped a coupon off the certificate and mailed it in to get paid." } },
        { type: 'cards', title: 'Bond vocabulary', cards: [
          { front: 'Issuer', back: 'Whoever borrows the money: a government, a city, or a company.' },
          { front: 'Face value', back: 'The amount repaid at maturity, often $1,000 per bond. Also called par.' },
          { front: 'Coupon', back: 'The fixed interest the bond pays, as a percent of face value.' },
          { front: 'Maturity', back: 'The date the issuer repays the face value and the bond ends.' },
          { front: 'Yield', back: 'The return you actually earn based on the price you paid, not just the coupon.' },
          { front: 'Credit rating', back: 'A grade from an agency estimating how likely the issuer is to pay you back.' },
        ] },
        { type: 'numeric', question: 'Leo buys a bond with a $5,000 face value and a 3% coupon. How much interest does it pay per year?', answer: 150, tolerance: 0.5, unit: '$', explain: '3% of $5,000 is $150 a year, probably paid as two $75 payments.' },
        { type: 'read', title: 'Why bond prices move', html: `<p>Bonds trade between investors after they are issued, and their prices move. The biggest reason is interest rates.</p>
<p>Leo bought a 10-year bond for $1,000 with a 3% coupon, so it pays $30 a year. A year later, rates have jumped and brand-new similar bonds pay 5%, or $50 a year. Leo wants to sell his bond. Who would pay $1,000 for $30 a year when $1,000 buys $50 a year elsewhere? Nobody.</p>
<p>So Leo's bond price has to <span class="down">drop</span> until a buyer would earn about the same 5% overall. With roughly nine years left, that is a price around <strong>$860</strong>. The buyer gets the $30 coupons <em>plus</em> a gain when the bond pays $1,000 at maturity.</p>
<p>It works in reverse too. If rates fall to 2%, Leo's 3% bond looks great and its price <span class="up">rises</span> above $1,000.</p>
<p>That is the most important rule in bonds: <span class="hl">when rates go up, existing bond prices go down, and vice versa</span>.</p>` },
        { type: 'diagram', name: 'bond-seesaw', caption: 'Rates on one side, prices on the other. Push rates up and existing bond prices drop, because older, lower coupons look worse next to new bonds.' },
        { type: 'check', question: 'Interest rates fall sharply. What tends to happen to the price of a bond you already own?', options: ['It falls, because the bond is now riskier', 'It rises, because its fixed coupon now looks better than new bonds', 'It stays exactly at face value until maturity', 'The coupon payment increases'], answer: 1, explain: 'The coupon is fixed. When new bonds pay less, your higher coupon is more valuable, so buyers pay more for it.' },
        { type: 'read', title: 'Coupon vs yield', html: `<p>The coupon never changes. The <strong>yield</strong> depends on the price you pay.</p>
<p><strong>Current yield</strong> is the yearly coupon divided by the price. A bond paying $50 a year bought for $900 has a current yield of about <strong>5.56%</strong>, higher than its 5% coupon.</p>
<p><span class="term" data-def="The total yearly return you would earn if you buy at today's price, hold until maturity, and every payment is made on time.">Yield to maturity</span> goes one step further. It also counts the gain or loss you lock in when the bond repays face value. Buy that $900 bond and hold it, and you also pocket an extra $100 at maturity, so your full yield is even higher than 5.56%.</p>
<p>A key comfort for individual bonds: if you <strong>hold to maturity</strong> and the issuer pays as promised, the price swings in between do not change what you collect. They matter if you need to sell early.</p>` },
        { type: 'read', title: 'Who is borrowing?', html: `<table><thead><tr><th>Type</th><th>Issuer</th><th>Risk</th><th>Tax on interest</th></tr></thead><tbody>
<tr><td>Treasuries</td><td>US federal government</td><td>Lowest default risk for US investors</td><td>Federal yes, state and local no</td></tr>
<tr><td>Corporate</td><td>Companies</td><td>Depends on the company; pays more to compensate</td><td>Federal and state</td></tr>
<tr><td>Municipal</td><td>States, cities, school districts</td><td>Usually low, but cities can and do default</td><td>Often federal-free; often state-free if you live in that state</td></tr>
</tbody></table>
<p>Corporate bonds pay higher yields than Treasuries of the same maturity because there is a real chance a company runs into trouble. Municipal bonds often pay lower yields, but their tax break can make them competitive for people in high tax brackets. You will see the tax math in the taxes lesson.</p>` },
        { type: 'read', title: 'Credit ratings and junk bonds', html: `<p>Agencies such as S&amp;P Global, Moody's and Fitch grade how likely an issuer is to pay. The scale runs from <strong>AAA</strong> (strongest) down through AA, A and BBB, and then into the Bs and Cs, ending at D for default.</p>
<ul>
<li><strong>Investment grade:</strong> BBB- or higher at S&amp;P and Fitch (Baa3 or higher at Moody's).</li>
<li><strong>High-yield, or "junk":</strong> anything below that line. These bonds pay more because default is a real possibility.</li>
</ul>
<p>Junk bonds can be a reasonable part of a portfolio for some investors, but they behave more like stocks in a crisis. In a recession, weaker companies are the first to miss payments, and junk bond prices can fall hard right when stocks do.</p>
<p>Ratings are opinions, not promises. In 2008, many mortgage-backed securities rated AAA collapsed in value. Use ratings as one input, never the only one.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A 10% bond yield is not a gift. It is the market telling you there is a real chance you do not get paid back." } },
        { type: 'match', prompt: 'Match each bond to its best description.', pairs: [
          { left: 'US Treasury bond', right: 'Backed by the federal government, state-tax-free interest' },
          { left: 'Municipal bond', right: 'Issued by a city or state, interest often federally tax-free' },
          { left: 'Investment-grade corporate', right: 'Company debt rated BBB- or better' },
          { left: 'Junk bond', right: 'Company debt rated below BBB-, higher yield for higher default risk' },
        ] },
        { type: 'read', title: 'Duration: how hard the seesaw swings', html: `<p>Not all bonds react the same to rate changes. A bond that matures in 6 months barely moves. A bond that matures in 30 years can swing a lot, because you are stuck with its coupon for a long time.</p>
<p><span class="term" data-def="A measure, in years, of how sensitive a bond's price is to interest rate changes. Higher duration means bigger price swings.">Duration</span> captures this in one number. A handy rule of thumb: <span class="hl">for each 1 percentage point rise in rates, a bond's price falls by about its duration in percent</span>.</p>
<ul>
<li>Duration 2: rates up 1 point, price down about 2%.</li>
<li>Duration 7: rates up 1 point, price down about 7%.</li>
<li>Duration 17: rates up 1 point, price down about 17%.</li>
</ul>
<p>This is not theory. In 2022, rates rose fast, and a broad index of US investment-grade bonds lost about 13%, one of its worst years on record. Funds full of long-term Treasuries fell much more. People who thought "bonds are safe" learned that bonds are safe from default, not from price swings.</p>` },
        { type: 'numeric', question: 'A bond fund has a duration of about 6 years. Rates rise 1 percentage point. Roughly how many dollars would a $10,000 position lose?', answer: 600, tolerance: 60, unit: '$', explain: 'Duration 6 means about a 6% drop for a 1-point rate rise. 6% of $10,000 is about $600. It is an estimate, not an exact figure.' },
        { type: 'read', title: 'Bond funds vs individual bonds', html: `<p>Most people own bonds through a <strong>bond fund</strong> or ETF that holds hundreds or thousands of bonds. Compare:</p>
<p><strong>Individual bond:</strong> has a maturity date. If the issuer pays, you get face value back on schedule no matter what rates did in between. But buying a well-diversified set of individual bonds takes a lot of money, and trading costs on small orders can be high.</p>
<p><strong>Bond fund:</strong> instant diversification, low minimums, and monthly income distributions. But a typical fund never matures. It keeps selling old bonds and buying new ones to hold a target duration, so there is no date when you are promised your money back. Its price can stay down for a while after rates rise, though it also starts buying newer, higher-yielding bonds. (Some special "defined maturity" funds do end on a set date.)</p>
<p>Neither is better for everyone. The key is to match duration to when you need the money.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Rule I follow: money needed in 2 years should not sit in a bond fund with a 15-year duration. Match the time frames." } },
        { type: 'truefalse', statement: 'A typical bond fund, like an individual bond, promises to return your full principal on a set maturity date.', answer: false, explain: 'Most bond funds have no maturity date. They hold a rolling portfolio, so your value depends on the fund price when you sell.' },
        { type: 'quiz', questions: [
          { q: 'A 4% coupon bond has a $1,000 face value. How much does it pay per year?', options: ['$4', '$400', '$40', 'It depends on the stock market'], answer: 2, explain: '4% of $1,000 face value is $40 a year, regardless of the bond price.' },
          { q: 'Rates rise from 3% to 5%. What happens to an existing 3% coupon bond?', options: ['Its price falls', 'Its price rises', 'Its coupon rises to 5%', 'It matures immediately'], answer: 0, explain: 'Its fixed 3% coupon is less attractive than new 5% bonds, so its price drops until its yield competes.' },
          { q: 'Which bond would usually swing the most if rates change by 1 percentage point?', options: ['A 3-month T-bill', 'A 2-year Treasury note', 'A 5-year corporate bond', 'A 30-year Treasury bond'], answer: 3, explain: 'Longer maturity means higher duration, and higher duration means bigger price moves for each rate change.' },
          { q: 'What does a BB rating from S&P signal?', options: ['Top-quality, nearly risk-free', 'Below investment grade, also called high-yield or junk', 'The bond has already defaulted', 'The bond is tax-free'], answer: 1, explain: 'Anything below BBB- is below investment grade. BB is the top of the high-yield range.' },
          { q: 'Why might a person in a high tax bracket choose a municipal bond that pays a lower yield than a corporate bond?', options: ['Muni interest is often exempt from federal tax, so the after-tax yield can be higher', 'Munis never lose value', 'Munis are guaranteed by the FDIC', 'Munis pay coupons every week'], answer: 0, explain: 'What you keep is what matters. A lower tax-free yield can beat a higher taxable yield for high earners.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'money-5-dividends',
      title: 'Dividends: Getting Paid to Own',
      summary: 'Dividend yield, payout ratio, the key dates, DRIPs, dividend growth, and why a giant yield is often a trap.',
      minutes: 14,
      icon: 'coin',
      steps: [
        { type: 'read', title: 'Owners get a cut', html: `<p>When you buy a share of stock, you own a tiny slice of a company. When that company makes a profit, its board of directors has choices: reinvest in the business, pay down debt, buy back shares, or hand some cash directly to owners. That last one is a <span class="term" data-def="Cash a company pays to its shareholders, usually from profits, typically every quarter in the US.">dividend</span>.</p>
<p>Many large, established US companies pay dividends every quarter. Younger, fast-growing companies often pay nothing, because they would rather pour every dollar back into growth.</p>
<p>Two key facts:</p>
<ul>
<li><strong>Dividends are not guaranteed.</strong> The board can raise, cut or cancel them. Unlike bond coupons, there is no legal promise to pay.</li>
<li><strong>You also own the price swings.</strong> A stock can pay you 3% a year and still drop 30% in a bad year.</li>
</ul>
<p>Most people collect dividends through funds. An index fund holding hundreds of companies passes along the dividends from all of them.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Own a slice, get a slice of the profits. That is the whole deal, and it is a pretty good one." } },
        { type: 'diagram', name: 'dividend-flow', caption: 'Profit flows from the company to shareholders as a dividend. You can spend it, or loop it back into more shares, which then earn their own dividends.' },
        { type: 'read', title: 'Yield and payout ratio', html: `<p><strong>Dividend yield</strong> tells you the income per dollar invested:</p>
<p><span class="hl">Dividend yield = annual dividend per share / share price</span></p>
<p>A stock at $50 paying $2 a year has a 4% yield. Own $10,000 of it and you collect about $400 a year, before taxes, as long as the dividend holds.</p>
<p><strong>Payout ratio</strong> tells you how much of the profit is being handed out:</p>
<p><span class="hl">Payout ratio = dividends per share / earnings per share</span></p>
<p>If that company earns $4 a share and pays $2, its payout ratio is 50%. It keeps half to reinvest and has a cushion if profits dip. A payout ratio near or above 100% means the company is paying out everything it earns, or more, which usually cannot last. Some business types, like REITs, normally run high ratios by design, so compare a company with its peers.</p>` },
        { type: 'numeric', question: 'Ms. Ortiz looks at a stock priced at $40 that pays $1.20 per share each year. What is its dividend yield?', answer: 3, tolerance: 0.05, unit: '%', explain: '$1.20 / $40 = 0.03, which is a 3% yield.' },
        { type: 'cards', title: 'Dividend vocabulary', cards: [
          { front: 'Declaration date', back: 'The day the board announces the dividend amount and the key dates.' },
          { front: 'Ex-dividend date', back: 'Buy on or after this date and you do not get the upcoming dividend.' },
          { front: 'Record date', back: 'The date the company checks its list of shareholders to see who gets paid.' },
          { front: 'Payment date', back: 'The day the cash actually lands in shareholder accounts.' },
          { front: 'DRIP', back: 'Dividend reinvestment plan: dividends automatically buy more shares.' },
        ] },
        { type: 'read', title: 'The dates that decide who gets paid', html: `<p>Here is the timing game. The company says: "We will pay everyone who is a shareholder of record on the <strong>record date</strong>." But stock trades take time to settle. In the US, trades settle in one business day (called T+1, since May 2024).</p>
<p>Because of that, the <strong>ex-dividend date</strong> is now usually the same day as the record date. The rule you need: <span class="hl">to get the dividend, you must buy before the ex-dividend date</span>. Buy on the ex-date or later, and the seller keeps that payment.</p>
<p>Now the catch that disappoints every dividend hunter. On the ex-dividend date, the stock price usually drops by roughly the amount of the dividend, because the company is about to send that cash out the door. It is not a perfect one-for-one move, since prices move for many reasons, but on average there is no free lunch.</p>
<p>Dev tried buying stocks the day before the ex-date and selling right after. He collected dividends, watched prices drop by about the same amount, and then owed taxes on the dividends. Net result: roughly zero, minus his time.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "A dividend is not new money. It moves value from the company's bank account to yours. The share price adjusts." } },
        { type: 'order', prompt: 'Put these dividend events in time order.', items: ['The board declares the dividend and sets the dates', 'You buy shares before the ex-dividend date', 'The ex-dividend date passes, and new buyers miss this payment', 'Payment date: cash lands in your account'], explain: 'Declaration comes first. You must own the shares before the ex-dividend date. Payment usually arrives days or weeks later.' },
        { type: 'truefalse', statement: 'Buying a stock right before the ex-dividend date and selling right after is a reliable way to collect free money.', answer: false, explain: 'The share price typically drops by about the dividend amount on the ex-date, and the dividend may be taxable. On average, the trick nets roughly nothing.' },
        { type: 'read', title: 'DRIPs and dividend growth', html: `<p>A <strong>DRIP</strong> automatically uses each dividend to buy more shares, often fractional shares, without you lifting a finger. More shares mean bigger dividends next time, which buy even more shares. That is compounding on autopilot. Most brokerages let you switch it on for stocks and funds.</p>
<p>Some companies also have a long habit of <strong>raising</strong> their dividend every year. Say Leo buys a stock at $50 that pays $1.50 a year, a 3% yield. If the company grows its dividend about 7% a year, the payment roughly doubles in ten years, to about $3. That is now a 6% yield on what Leo originally paid, even if the stock price never moved. (Usually it does move, since a company that can keep raising its dividend tends to be growing.)</p>
<p>Past raises do not guarantee future ones. Plenty of companies with long raise streaks have eventually cut. But dividend growth is a big reason some investors focus on steady growers instead of the highest current yield.</p>` },
        { type: 'widget', name: 'dividend-income', props: { portfolio: 30000, yield: 3 }, caption: 'Change the portfolio size and yield to see the yearly and monthly income. Notice how big a portfolio it takes to cover even one monthly bill.' },
        { type: 'read', title: 'The yield trap', html: `<p>Remember the formula: yield = dividend / price. Now watch what happens when the price crashes.</p>
<p>A stock trades at $40 and pays $2 a year, a 5% yield. Bad news hits and the stock falls to $16. The dividend has not been cut <em>yet</em>, so the yield now shows <strong>12.5%</strong>. Screeners light up. Social media posts call it "the best dividend on the market."</p>
<p>But the price fell for a reason. Often the market expects profits to shrink and the dividend to be <span class="down">cut</span>. When the cut comes, the yield shrinks, the price may fall again, and the buyers who chased 12.5% get hit twice.</p>
<p>Warning signs of a yield trap:</p>
<ul>
<li>A yield far above similar companies.</li>
<li>A payout ratio above 100% for more than a brief stretch.</li>
<li>Falling revenue or rising debt.</li>
<li>A share price that has collapsed recently.</li>
</ul>`,
          sprite: { who: 'grizz', mood: 'warn', say: "A sky-high yield is usually not a gift. It is the market whispering that the dividend might not survive." } },
        { type: 'check', question: 'Which of these is the strongest yield-trap warning sign?', options: ['A 2.5% yield with a 45% payout ratio and steady earnings', 'A 13% yield after the price fell 60%, with a payout ratio of 150%', 'A 0% yield from a fast-growing company', 'A 3.5% yield that has risen slowly for 15 years'], answer: 1, explain: 'A huge yield created by a price collapse, plus paying out more than the company earns, is the classic setup for a dividend cut.' },
        { type: 'callout', variant: 'tip', title: 'Think total return', html: `<p>What you really earn is <strong>total return</strong>: price change plus dividends. A stock that pays 6% but loses 10% a year is a losing investment. A fund that pays 1.5% but grows 8% a year is doing great. Dividends are a nice, visible form of return, but they are not extra money on top of the company's value. Judge the whole package.</p>` },
        { type: 'quiz', questions: [
          { q: 'A stock costs $80 and pays $3.20 a year in dividends. What is its yield?', options: ['2.5%', '3.2%', '5%', '4%'], answer: 3, explain: '$3.20 / $80 = 0.04, or 4%.' },
          { q: 'A company earns $5 per share and pays $4 per share in dividends. What is its payout ratio?', options: ['80%', '125%', '20%', '4%'], answer: 0, explain: '$4 / $5 = 0.8, or 80%. It pays out most of its profit, leaving a thin cushion.' },
          { q: 'Maya wants this quarter\'s dividend. When must she buy the stock?', options: ['On the payment date', 'Before the ex-dividend date', 'On the ex-dividend date', 'Any time before the payment date'], answer: 1, explain: 'Buying before the ex-dividend date makes you the shareholder of record. Buying on or after it means the seller gets the payment.' },
          { q: 'What does a DRIP do?', options: ['Pays dividends twice as often', 'Removes taxes on dividends', 'Automatically uses dividends to buy more shares', 'Guarantees the dividend will not be cut'], answer: 2, explain: 'A dividend reinvestment plan turns each payout into more shares, which compounds over time. Reinvested dividends are still taxable in a regular account.' },
          { q: 'A stock\'s yield jumped from 4% to 11% in three months, though the dividend amount did not change. What most likely happened?', options: ['The company doubled its profits', 'The share price fell sharply', 'The company issued a special dividend', 'Interest rates fell'], answer: 1, explain: 'Yield = dividend / price. If the dividend stayed the same and the yield nearly tripled, the price must have dropped a lot, which is a yield-trap warning.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'money-5-reits-real-estate',
      title: 'REITs and Rent: Real Estate Income',
      summary: 'How REITs pay out rent and interest, what owning a rental is really like, and the risks of real estate crowdfunding.',
      minutes: 14,
      icon: 'house',
      steps: [
        { type: 'read', title: 'The landlord fantasy', html: `<p>"Buy a house, rent it out, collect checks forever." It is one of the most popular passive income dreams. There is truth in it: real estate has made many families wealthy, and rent is a classic income stream.</p>
<p>But there are two very different ways to earn from real estate:</p>
<ul>
<li><strong>Own property directly.</strong> You buy a building, find tenants, handle repairs, and keep what is left after the bills.</li>
<li><strong>Own shares of real estate companies.</strong> You buy a REIT or a REIT fund in a brokerage account, and professionals deal with the tenants.</li>
</ul>
<p>One requires hundreds of thousands of dollars (usually borrowed) and phone calls at 11 p.m. The other can start with the price of a single share. Let's look at both honestly.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "You can own a slice of warehouses, apartments and cell towers without ever unclogging a drain. Love that for us." } },
        { type: 'read', title: 'What a REIT is', html: `<p>A <span class="term" data-def="Real estate investment trust: a company that owns or finances income-producing real estate and must pay out most of its taxable income to shareholders.">REIT</span> (real estate investment trust) is a company that owns or finances income-producing real estate: apartment complexes, warehouses, office towers, shopping centers, hospitals, data centers, even cell towers. Congress created the structure in 1960 so regular people could invest in big properties.</p>
<p>The deal REITs make with the tax code:</p>
<ul>
<li>They must pay out <span class="hl">at least 90% of their taxable income</span> to shareholders as dividends.</li>
<li>Most of their assets and income must come from real estate.</li>
<li>In exchange, they generally do not pay corporate income tax on the income they distribute.</li>
</ul>
<p>That 90% rule is why REIT dividend yields are often higher than the average stock's. It also means REITs keep little cash, so they usually grow by borrowing or selling new shares.</p>
<p>Most REITs you can buy trade on stock exchanges, so you can buy and sell them any trading day, just like a stock.</p>`,
          sprite: { who: 'hoot', mood: 'think', say: "The 90% payout rule is the price of skipping corporate income tax. The taxes show up on the shareholders' side instead." } },
        { type: 'cards', title: 'Real estate income terms', cards: [
          { front: 'Equity REIT', back: 'Owns buildings and earns money mostly from rent.' },
          { front: 'Mortgage REIT', back: 'Owns mortgages or mortgage securities and earns money mostly from interest.' },
          { front: 'Non-traded REIT', back: 'A REIT not listed on an exchange. Hard to sell and often expensive to buy into.' },
          { front: 'Vacancy', back: 'Time a rental sits empty and earns no rent while the bills keep coming.' },
          { front: 'Leverage', back: 'Using borrowed money to buy an asset, which magnifies both gains and losses.' },
        ] },
        { type: 'read', title: 'Equity REITs vs mortgage REITs', html: `<p><strong>Equity REITs</strong> are the landlords. They own buildings and collect rent. Over time, their income can rise as rents rise, and the buildings themselves may gain value. Most of the REIT market by value is equity REITs.</p>
<p><strong>Mortgage REITs</strong> (often called mREITs) are lenders. They buy mortgages or mortgage-backed securities and earn the difference between the interest they collect and the cost of the money they borrow. They often show eye-catching yields, but they use a lot of leverage and can be hit hard when interest rates move quickly. Many cut their dividends sharply during past rate shocks.</p>
<p>A third group deserves a warning: <strong>non-traded REITs</strong>. They are sold by some brokers and advisers, are not listed on an exchange, and may let you cash out only in limited amounts or not at all for years. Regulators such as FINRA have repeatedly warned investors about their fees and how hard they are to sell. Ask how you get out before you ask what it pays.</p>` },
        { type: 'check', question: 'Which type of REIT earns its income mainly from interest on loans rather than rent?', options: ['An equity REIT', 'A mortgage REIT', 'A data center REIT', 'An apartment REIT'], answer: 1, explain: 'Mortgage REITs hold loans and mortgage securities, so their income is interest. The others own properties and collect rent.' },
        { type: 'truefalse', statement: 'To keep their special tax status, REITs must distribute at least 90% of their taxable income to shareholders.', answer: true, explain: 'The 90% distribution requirement is the core of the REIT rules and the reason their dividends tend to be large.' },
        { type: 'read', title: 'REITs: the fine print', html: `<p>REITs are a real way to get real estate income without being a landlord, but know what you are buying:</p>
<ul>
<li><strong>Prices swing like stocks.</strong> REIT prices can fall 20% or more in a rough year. In 2020 and again in 2022, many REITs dropped sharply.</li>
<li><strong>Rate sensitive.</strong> Rising interest rates raise REIT borrowing costs and make their yields look less special next to bonds, which often pushes prices down.</li>
<li><strong>Sector risk.</strong> Office buildings, malls, warehouses and data centers live very different lives. Owning one REIT is a bet on one corner of the property market. A REIT index fund spreads that out.</li>
<li><strong>Taxes.</strong> Most REIT dividends are not "qualified" dividends, so in a regular taxable account they are generally taxed at your ordinary income rate, though a special deduction can reduce part of that. This is one reason some investors hold REITs inside tax-advantaged accounts. Tax rules change, so check the current treatment.</li>
</ul>` },
        { type: 'read', title: 'Owning a rental: the real math', html: `<p>Ms. Ortiz is thinking about buying a small rental house. Here is an illustrative monthly picture:</p>
<table><thead><tr><th>Item</th><th>Monthly</th></tr></thead><tbody>
<tr><td>Rent</td><td><span class="up">+$2,000</span></td></tr>
<tr><td>Mortgage, property tax, insurance</td><td><span class="down">-$1,500</span></td></tr>
<tr><td>Looks like profit</td><td>$500</td></tr>
<tr><td>Vacancy (about one empty month a year)</td><td><span class="down">-$167</span></td></tr>
<tr><td>Repairs and maintenance</td><td><span class="down">-$150</span></td></tr>
<tr><td>Savings for big items (roof, water heater)</td><td><span class="down">-$100</span></td></tr>
<tr><td>Real profit</td><td><strong>about $83</strong></td></tr>
</tbody></table>
<p>The $500 "profit" melts once you budget for the things that will happen eventually. If she hires a property manager, who often charges a percentage of rent, the profit may vanish entirely. Many landlords still come out ahead over time, mostly because the mortgage gets paid down and the property may appreciate. But the monthly cash flow is often thinner than the fantasy.</p>` },
        { type: 'numeric', question: 'A rental brings in $1,800 a month in rent. The mortgage, taxes and insurance cost $1,350. Vacancy, repairs and reserves average $330 a month. What is the real monthly cash flow?', answer: 120, tolerance: 0.5, unit: '$', explain: '$1,800 - $1,350 - $330 = $120 a month. The headline $450 shrinks fast once real costs are counted.' },
        { type: 'read', title: 'Leverage and the part-time job', html: `<p>Most rentals are bought with a mortgage. That is <strong>leverage</strong>, and it cuts both ways.</p>
<p>Say a $300,000 property is bought with $60,000 down. If the value rises 10%, that is a $30,000 gain, or <span class="up">+50%</span> on the $60,000 of cash. If the value falls 10%, the owner has lost <span class="down">-50%</span> of that cash on paper, and still owes the full mortgage. If the house sits empty or needs a $15,000 repair, the payments do not pause.</p>
<p>Then there is the work. Tenants call when the heat breaks. Leases have to be written, rent collected, laws followed, and sometimes a tenant has to be evicted, which is slow, costly and stressful. Landlords also cannot easily sell one bedroom when they need cash.</p>
<p>That is why many experienced landlords will tell you: owning rentals is a <span class="hl">business and a part-time job</span>, not passive income. It can be a good business. It is still a business.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Leverage turned a 10% price drop into a 50% hit on your cash. Banks do not care that the tenant moved out." } },
        { type: 'read', title: 'Real estate crowdfunding', html: `<p>Online platforms now let people put a few hundred or few thousand dollars into a specific building, a development project, or a pool of real estate loans. Some are open to regular investors under SEC rules that cap how much non-wealthy people can invest.</p>
<p>The pitch sounds great: projected returns, glossy photos, low minimums. The risks are real:</p>
<ul>
<li><strong>Illiquid.</strong> Your money can be locked up for years, with no easy way to sell early.</li>
<li><strong>Concentrated.</strong> One project, one sponsor, one city. If it goes bad, there is nothing to balance it.</li>
<li><strong>Projections are not results.</strong> Targeted returns are estimates made by the people selling the deal.</li>
<li><strong>Fees</strong> can be layered at the platform level and the project level.</li>
<li><strong>Platform risk.</strong> Some platforms have shut down or seen projects fail, leaving investors waiting years to recover what they could.</li>
</ul>
<p>If you ever consider one, read the offering documents, check the sponsor's track record, and only use money you will not need for a long time.</p>` },
        { type: 'match', prompt: 'Match each way to earn real estate income with its biggest drawback.', pairs: [
          { left: 'Publicly traded REIT fund', right: 'Price can swing like the stock market' },
          { left: 'Mortgage REIT', right: 'Heavy leverage and sensitivity to rate moves' },
          { left: 'Crowdfunded property deal', right: 'Money may be locked up for years in one project' },
          { left: 'Owning a rental directly', right: 'Vacancies, repairs, tenants and a big mortgage' },
        ] },
        { type: 'order', prompt: 'Order these from least hands-on to most hands-on.', items: ['REIT index fund in a brokerage account', 'Real estate crowdfunding investment', 'Rental property with a hired property manager', 'Rental property you manage yourself'], explain: 'A REIT fund needs only a buy order. Crowdfunding needs research but no management. A managed rental still needs you to make decisions and fund repairs. Self-managing means you are the landlord, the scheduler and often the repair crew.' },
        { type: 'quiz', questions: [
          { q: 'What share of taxable income must a REIT distribute to shareholders to keep its tax status?', options: ['At least 50%', 'At least 75%', 'At least 90%', '100%, always'], answer: 2, explain: 'REITs must distribute at least 90% of taxable income, which is why their dividends tend to be large.' },
          { q: 'Why do REIT prices often fall when interest rates rise sharply?', options: ['Rising rates raise their borrowing costs and make bond yields more competitive', 'REITs are required to sell buildings when rates rise', 'Rates have no effect on REITs', 'The 90% rule is suspended'], answer: 0, explain: 'REITs borrow heavily, and income investors can switch to bonds when bond yields climb. Both pressure REIT prices.' },
          { q: 'Leo buys a $250,000 condo with $50,000 down. Its value falls 10%. What happened to his equity, ignoring mortgage paydown?', options: ['It fell 10%', 'It fell 2%', 'It stayed the same', 'It fell 50%'], answer: 3, explain: 'A 10% drop is $25,000. That is half of his $50,000 down payment. Leverage magnifies losses on your cash.' },
          { q: 'Which is the biggest red flag about a non-traded REIT pitch?', options: ['It is regulated by the SEC', 'You may not be able to sell for years, and fees can be high', 'It owns real buildings', 'It pays a dividend'], answer: 1, explain: 'Illiquidity and high fees are the main concerns regulators have highlighted for non-traded REITs.' },
          { q: 'Which statement best describes owning a rental property?', options: ['Fully passive once you buy it', 'Risk-free because people always need housing', 'A business with real work, costs and leverage risk', 'Only possible for millionaires'], answer: 2, explain: 'Rentals can build wealth, but they involve tenants, repairs, vacancies and debt. It is closer to a part-time job than passive income.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'money-5-index-income-engine',
      title: 'The Index Fund Income Engine',
      summary: 'How a diversified portfolio becomes a paycheck: the 4% rule, FIRE, the size of portfolio you need, and sequence-of-returns risk.',
      minutes: 15,
      icon: 'fire',
      steps: [
        { type: 'read', title: 'The most boring engine wins', html: `<p>An <span class="term" data-def="A fund that simply buys every stock (or bond) in a market index, like the S&amp;P 500, instead of picking winners.">index fund</span> buys an entire market, hundreds or thousands of companies, and charges a tiny fee to do it. You do not pick stocks, you do not time the market, you do not stare at charts. That is passive investing in the most literal sense.</p>
<p>Over long periods, a broad US stock index has grown far faster than savings accounts or bonds, through a mix of rising prices and reinvested dividends. That growth has never been smooth. There have been crashes of 30%, 40%, and even 50% along the way, and some stretches where stocks went nowhere for a decade.</p>
<p>Here is the idea that turns index funds into a passive income engine: you do not have to live on dividends alone. Once a portfolio is big enough, you can <span class="hl">sell a small slice each year</span> and spend it, while the rest keeps growing. The question everyone asks is: how big a slice is safe?</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "No stock picking, no chart staring, tiny fees. The index fund is the couch potato of investing, and that is a compliment." } },
        { type: 'diagram', name: 'compound-curve', caption: 'Compound growth starts slow and then bends upward. The early years feel useless, but they set up the steep part of the curve later.' },
        { type: 'read', title: 'Where the 4% rule came from', html: `<p>In 1994, a financial planner named <strong>William Bengen</strong> tested a simple question against historical US market data: if a retiree withdraws a fixed amount each year, raised for inflation, what starting withdrawal would have survived every 30-year period he studied? His answer was about <strong>4%</strong> of the starting portfolio, using a mix of stocks and bonds.</p>
<p>In 1998, three professors at Trinity University ran a similar study, now known as the <strong>Trinity study</strong>, and found that a 4% starting withdrawal held up for 30 years in the large majority of historical periods for portfolios with a solid share of stocks.</p>
<p>How it works:</p>
<ul>
<li>Year 1: withdraw 4% of the portfolio. On $500,000, that is $20,000.</li>
<li>Each later year: withdraw the same dollar amount, adjusted for inflation, no matter what the market did.</li>
</ul>
<p>It is a <span class="hl">rule of thumb based on past data, not a guarantee</span>. The future does not have to look like the past.</p>`,
          sprite: { who: 'hoot', mood: 'wow', say: "The 4% rule is a research finding about history, not a law of physics. Treat it like a weather forecast, not a promise." } },
        { type: 'read', title: 'How big a portfolio for $X a month?', html: `<p>Flip the 4% rule around and you get a quick estimate: <span class="hl">portfolio needed = yearly spending x 25</span>. (Dividing by 0.04 is the same as multiplying by 25.)</p>
<table><thead><tr><th>Monthly income wanted</th><th>Yearly</th><th>Portfolio at 4%</th></tr></thead><tbody>
<tr><td>$100</td><td>$1,200</td><td>$30,000</td></tr>
<tr><td>$500</td><td>$6,000</td><td>$150,000</td></tr>
<tr><td>$1,000</td><td>$12,000</td><td>$300,000</td></tr>
<tr><td>$3,000</td><td>$36,000</td><td>$900,000</td></tr>
<tr><td>$5,000</td><td>$60,000</td><td>$1,500,000</td></tr>
</tbody></table>
<p>Big numbers. But they are reachable over a working life for many people with steady saving, and every row you climb covers another bill. $500 a month might cover a car payment and insurance. That alone changes your options.</p>
<p>Remember that taxes, fees and any income you get from elsewhere (like Social Security later in life or a part-time job) change the real number. This is a starting estimate.</p>` },
        { type: 'numeric', question: 'Using the 4% rule as a rough guide, how big a portfolio would produce about $2,000 a month?', answer: 600000, tolerance: 1, unit: '$', explain: '$2,000 x 12 = $24,000 a year. $24,000 x 25 = $600,000.' },
        { type: 'callout', variant: 'warn', title: 'The 4% rule has real limits', html: `<p>The original research assumed a <strong>30-year</strong> retirement and used <strong>US history</strong>, which was one of the strongest markets in the world. It did not fully account for fund fees or taxes. Researchers still argue about it. Some suggest a lower starting rate, such as 3% to 3.5%, for retirements of 40 to 50 years or when stock prices are high relative to earnings. Bengen himself later argued that a somewhat higher starting rate held up for a more diversified portfolio. Use 4% as a planning sketch, not a promise.</p>` },
        { type: 'read', title: 'FIRE: Financial Independence, Retire Early', html: `<p><strong>FIRE</strong> is a movement of people who save aggressively, often half their income or more, so they can reach their "25x" number decades before a traditional retirement age.</p>
<p>The key insight is about the <span class="term" data-def="The share of your take-home pay that you save and invest instead of spending.">savings rate</span>. Saving more does two things at once: it grows your portfolio faster <em>and</em> it shows you can live on less, which shrinks the number you need.</p>
<p>Leo takes home $4,000 a month. If he spends $3,600 and saves $400, he needs a portfolio covering $43,200 a year. If he spends $2,800 and saves $1,200, he needs to cover only $33,600 a year, and he is saving three times as fast.</p>
<p>Many FIRE followers do not stop working forever. They "retire" to lower-stress or part-time work, which is a big safety valve. And because an early retirement can last 50 years, many use a more cautious withdrawal rate than 4%.</p>` },
        { type: 'widget', name: 'compound-interest', props: { principal: 5000, monthly: 500, rate: 7, years: 30 }, caption: 'Try it: Leo starts with $5,000 and adds $500 a month. The 7% is an illustrative long-run return, not a promise. Change the monthly amount and see how much more it matters than tiny rate tweaks.' },
        { type: 'check', question: 'Why does raising your savings rate speed up financial independence so much?', options: ['It guarantees a higher investment return', 'It grows the portfolio faster and lowers the spending the portfolio must cover', 'It avoids all taxes', 'It lets you skip an emergency fund'], answer: 1, explain: 'Saving more is a double win: more money invested, and a lower yearly spending number to reach.' },
        { type: 'read', title: 'Sequence-of-returns risk', html: `<p>Here is the sneakiest risk for anyone living off a portfolio. The <strong>order</strong> of returns matters, not just the average.</p>
<p>Two retirees each start with $1,000,000 and withdraw $40,000 at the start of each year (kept flat for simplicity). Over 10 years, both get the exact same returns: one year of <span class="down">-25%</span> and nine years of <span class="up">+8%</span>. Only the order differs.</p>
<ul>
<li><strong>Retiree A</strong> gets the crash in year 1. After 10 years: about <strong>$900,000</strong>.</li>
<li><strong>Retiree B</strong> gets the crash in year 10. After 10 years: about <strong>$1,065,000</strong>.</li>
</ul>
<p>Same average, roughly $165,000 apart. Why? Retiree A sold shares to cover spending right after prices fell, locking in losses. Those shares were not around to enjoy the rebound.</p>
<p>While you are still adding money, a crash early on actually helps, because you buy cheap. Once you are withdrawing, an early crash hurts. That is <span class="hl">sequence-of-returns risk</span>.</p>` },
        { type: 'truefalse', statement: 'Two retirees who earn the same average return and withdraw the same amounts will always end up with the same balance.', answer: false, explain: 'When you are withdrawing, the order of returns matters. Big losses early force you to sell more shares at low prices.' },
        { type: 'read', title: 'Defending against a bad start', html: `<p>People who plan to live off a portfolio use a few common defenses against sequence risk:</p>
<ul>
<li><strong>A cash or bond cushion.</strong> Keep a year or two of spending in safe assets, so you are not forced to sell stocks during a crash.</li>
<li><strong>Flexible spending.</strong> Cut withdrawals a bit after a bad year. Even small cuts improve the odds a lot.</li>
<li><strong>Some income from elsewhere.</strong> Part-time work, a side business, or later, Social Security, reduces how much the portfolio must carry.</li>
<li><strong>A more cautious rate</strong> for very long retirements.</li>
</ul>
<p>Notice the theme: <span class="hl">the plan needs flexibility</span>. Anyone promising a fixed, guaranteed income stream from a stock portfolio is overpromising.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Crashes happen. The plan that survives is the one that does not have to sell at the bottom." } },
        { type: 'order', prompt: 'Put these steps for estimating your financial independence number in order.', items: ['Track what you actually spend in a year', 'Subtract income you expect from other sources', 'Multiply the remaining gap by 25 for a 4% rough guide', 'Add a margin for taxes, fees and a longer horizon'], explain: 'Start from real spending, cover what other income will not, apply the rule of thumb, then pad it, because the rule assumes no taxes or fees and a 30-year horizon.' },
        { type: 'quiz', questions: [
          { q: 'Which best describes the 4% rule?', options: ['A guaranteed safe withdrawal rate', 'An IRS limit on withdrawals', 'The average dividend yield of the S&P 500', 'A rule of thumb from historical research on 30-year retirements'], answer: 3, explain: 'It came from Bengen and the Trinity study testing past US data. Useful as a guide, not a promise.' },
          { q: 'About how big a portfolio does the 4% rule suggest for $40,000 a year of spending?', options: ['$1,000,000', '$160,000', '$400,000', '$4,000,000'], answer: 0, explain: '$40,000 x 25 = $1,000,000.' },
          { q: 'Under the 4% rule, what happens to the withdrawal after year one?', options: ['It is always 4% of the new balance', 'It stays the same dollar amount, adjusted for inflation', 'It doubles every ten years', 'It stops if the market falls'], answer: 1, explain: 'The original method sets the first-year dollar amount and then raises it with inflation each year.' },
          { q: 'Sequence-of-returns risk is most dangerous when...', options: ['You are a teenager making your first deposits', 'You only own Treasury bills', 'You start withdrawing just as a big market drop hits', 'Inflation is exactly 2%'], answer: 2, explain: 'Selling shares to fund spending right after a crash locks in losses and leaves fewer shares to recover.' },
          { q: 'Why do many early retirees use a withdrawal rate below 4%?', options: ['Their retirements may last 40 to 50 years, longer than the research assumed', 'Lower rates are required by law', 'Index funds stop paying dividends after 30 years', 'The 4% rule only applies to bonds'], answer: 0, explain: 'The classic studies covered 30-year periods. A longer horizon needs more margin for bad sequences.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 7
    {
      id: 'money-5-taxes-on-investment-income',
      title: 'The Tax Bite on Passive Income',
      summary: 'Short vs long-term gains, qualified vs ordinary dividends, interest, munis, tax-advantaged accounts, wash sales and tax-loss harvesting.',
      minutes: 15,
      icon: 'receipt',
      steps: [
        { type: 'read', title: 'Meet your silent partner', html: `<p>Every passive income stream in this chapter has a silent partner: the government. In a regular taxable account, interest, dividends and profits from selling investments are generally taxable income.</p>
<p>The good news is that <span class="hl">not all investment income is taxed the same way</span>. The type of income, how long you held the investment, and what kind of account it sits in can change your tax bill a lot. Two people earning the same $1,000 can owe very different amounts.</p>
<p>A heads-up before the numbers: US tax brackets and thresholds are adjusted every year, and Congress changes the rules from time to time. Every rate and dollar figure in this lesson is a <strong>simplified illustration</strong>. When it is real money, look up the current year's numbers from the IRS or ask a tax professional. This lesson covers US federal rules; states add their own.</p>`,
          sprite: { who: 'bolt', mood: 'think', say: "Rule check: tax brackets update every year. I store the logic, not the numbers. You should too." } },
        { type: 'read', title: 'Capital gains: short vs long', html: `<p>When you sell an investment for more than you paid, the profit is a <span class="term" data-def="Profit from selling an investment for more than you paid for it.">capital gain</span>. While you still hold it, the gain is "unrealized" and not taxed. Selling makes it "realized."</p>
<ul>
<li><strong>Short-term:</strong> held <strong>one year or less</strong>. Taxed at your ordinary income tax rate, the same as wages.</li>
<li><strong>Long-term:</strong> held <strong>more than one year</strong>. Taxed at special lower rates, currently 0%, 15% or 20% depending on your taxable income. Many people with modest incomes pay 0% on long-term gains.</li>
</ul>
<p>Higher earners may also owe an extra 3.8% net investment income tax on top. The income cutoffs for each rate change yearly.</p>
<p>Here is why it matters to Dev. He day-trades, so nearly all his gains are short-term and taxed like a paycheck. A patient index investor who holds for years pays the lower long-term rates, and only when they sell. Same market, very different tax treatment.</p>` },
        { type: 'numeric', question: 'Maya has a $1,000 gain. Using illustrative rates of 22% for short-term and 15% for long-term, how many dollars of tax does she save by qualifying for long-term treatment?', answer: 70, tolerance: 0.5, unit: '$', explain: 'Short-term: $1,000 x 22% = $220. Long-term: $1,000 x 15% = $150. Waiting saves $70. Real rates depend on her income and the current year.' },
        { type: 'check', question: 'Leo bought shares on March 10, 2025 and sold them at a gain on March 10, 2026. How is the gain treated?', options: ['Long-term, because he held them for a full year', 'Short-term, because he did not hold them for more than one year', 'Tax-free, because he held them at least a year', 'It depends on whether the stock pays dividends'], answer: 1, explain: 'Long-term requires more than one year. The IRS starts counting the day after purchase, so selling on the one-year anniversary is still short-term. One more day would have done it.' },
        { type: 'read', title: 'Dividends and interest', html: `<p><strong>Qualified dividends</strong> get the same lower rates as long-term capital gains. Most regular dividends from US companies, and from many foreign companies, count, as long as you held the shares long enough: <strong>more than 60 days</strong> during the 121-day window that starts 60 days before the ex-dividend date.</p>
<p><strong>Ordinary (nonqualified) dividends</strong> are taxed at your regular income rate. Most REIT dividends fall here, as do dividends on shares you held too briefly.</p>
<p><strong>Interest</strong> from savings accounts, CDs and corporate bonds is taxed as <strong>ordinary income</strong>.</p>
<p>Two big exceptions for interest:</p>
<ul>
<li><strong>US Treasury interest</strong> (T-bills, notes, bonds, I bonds) is federally taxable but <span class="hl">exempt from state and local income tax</span>.</li>
<li><strong>Municipal bond interest</strong> is <span class="hl">often free from federal income tax</span>, and often from state tax too if the bond is from your own state. Some munis are exceptions, so check.</li>
</ul>` },
        { type: 'match', prompt: 'Match each type of income to its usual federal tax treatment in a taxable account.', pairs: [
          { left: 'Stock sold after 8 months', right: 'Short-term gain, ordinary income rates' },
          { left: 'Fund sold after 3 years', right: 'Long-term gain, lower capital gains rates' },
          { left: 'Qualified dividend', right: 'Taxed at long-term capital gains rates' },
          { left: 'High-yield savings interest', right: 'Ordinary income rates' },
          { left: 'Most municipal bond interest', right: 'Often exempt from federal income tax' },
        ] },
        { type: 'read', title: 'Tax-free vs taxable yields', html: `<p>To compare a tax-free muni with a taxable bond, convert the muni to a <strong>tax-equivalent yield</strong>:</p>
<p><span class="hl">Tax-equivalent yield = muni yield / (1 - your tax rate)</span></p>
<p>Ms. Ortiz is in an illustrative 32% federal bracket. A muni pays 3% tax-free. Its tax-equivalent yield is 3% / 0.68 = about <strong>4.41%</strong>. A corporate bond would need to pay more than 4.41% just to match it after tax.</p>
<p>For Maya, who pays little or no income tax, the muni's tax break is worth almost nothing, so a higher-yielding taxable bond or Treasury may leave her with more. <span class="hl">Tax breaks are worth more to people in higher brackets.</span> That is why munis are popular with high earners and pretty pointless inside an account that is already tax-sheltered.</p>` },
        { type: 'numeric', question: 'A muni bond pays 2.8% tax-free. For someone in a 24% bracket, what is the tax-equivalent yield? Round to two decimals.', answer: 3.68, tolerance: 0.05, unit: '%', explain: '2.8% / (1 - 0.24) = 2.8% / 0.76 = about 3.68%. A taxable bond would need to pay more than that to come out ahead.' },
        { type: 'read', title: 'Tax-advantaged accounts: the shelter', html: `<p>The single biggest tax move for most people is not a clever trade. It is <strong>where</strong> the money lives. Inside tax-advantaged retirement accounts, interest, dividends and gains are <span class="hl">not taxed year by year</span>.</p>
<ul>
<li><strong>Roth IRA / Roth 401(k):</strong> you put in money you already paid tax on. Growth and qualified withdrawals in retirement are tax-free.</li>
<li><strong>Traditional IRA / 401(k):</strong> contributions can lower your taxes now. Withdrawals in retirement are taxed as ordinary income.</li>
<li><strong>HSA:</strong> for people with a qualifying health plan. Money can go in, grow and come out for medical costs without tax.</li>
</ul>
<p>Anyone with earned income, including a teen with a job, can contribute to an IRA, up to their earned income or the annual limit, whichever is lower. Minors usually need a custodial account opened by an adult. The limits change every year, and early withdrawals can bring taxes and penalties, so check the current rules.</p>`,
          sprite: { who: 'penny', mood: 'wow', say: "A Roth IRA opened at 17 with café money could grow for 40-plus years with no tax on the growth. That is a long nap for a dollar." } },
        { type: 'diagram', name: 'account-types', caption: 'Each account handles taxes differently: pay tax now, pay tax later, or in the HSA case, potentially never. Regular taxable brokerage accounts get no special shelter.' },
        { type: 'read', title: 'Tax-loss harvesting', html: `<p>Investments lose money sometimes. <span class="term" data-def="Selling an investment at a loss on purpose so the loss can reduce your taxes on gains or income.">Tax-loss harvesting</span> turns that sting into a small benefit.</p>
<p>When you sell at a loss in a taxable account, the realized loss first cancels out capital gains. If losses are bigger than gains, you can deduct up to <strong>$3,000</strong> a year of the excess against ordinary income ($1,500 if married filing separately). Anything left over carries forward to future years.</p>
<p>Example: Leo sold one fund for a $2,000 gain and another for a $2,500 loss. The loss wipes out the gain and leaves $500 to deduct against his other income.</p>
<p>Harvesting does not make a bad investment good. It lowers taxes today, and often means a larger taxable gain later, because your new shares start from a lower cost. It matters only in taxable accounts. Losses inside an IRA or 401(k) do not count.</p>` },
        { type: 'read', title: 'The wash-sale rule', html: `<p>Dev had an idea: sell his losing stock on December 15 to book the tax loss, then buy it right back so he does not miss a rebound. The IRS saw that coming decades ago.</p>
<p>The <span class="term" data-def="A rule that blocks a tax loss if you buy the same or a substantially identical investment within 30 days before or after selling it at a loss.">wash-sale rule</span> says: if you sell at a loss and buy the <strong>same or a substantially identical</strong> investment within <strong>30 days before or after</strong> the sale, you cannot claim the loss right now. Instead, the disallowed loss is added to the cost basis of the new shares, so the benefit is pushed into the future.</p>
<p>The window covers 61 days in total. And it applies across your accounts, so buying the same stock in your IRA within the window can also trigger it, which permanently wastes the loss.</p>
<p>Investors who harvest losses but want to stay invested often switch to a similar but not substantially identical investment for at least 31 days. Exactly what counts as "substantially identical" is not always clear-cut, so this is a good place for professional advice.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Sell for a tax loss and buy back next week? The IRS calls that a wash sale. Your loss gets parked, not paid." } },
        { type: 'truefalse', statement: 'Dev sells a stock at a loss on December 15 and buys the exact same stock back on January 5. He can deduct the loss on this year\'s taxes.', answer: false, explain: 'January 5 is within 30 days after the sale, so the wash-sale rule disallows the loss for now. It gets added to the cost basis of the new shares.' },
        { type: 'quiz', questions: [
          { q: 'What holding period qualifies a gain for long-term capital gains rates?', options: ['More than 30 days', 'At least 6 months', 'One year or less', 'More than one year'], answer: 3, explain: 'Long-term requires holding more than one year. One year or less is short-term.' },
          { q: 'How is interest from a bank CD taxed federally in a regular account?', options: ['As ordinary income', 'At long-term capital gains rates', 'It is tax-free', 'Only if you withdraw it'], answer: 0, explain: 'Bank interest is ordinary income, taxed at your regular rate in the year it is paid, even if you leave it in the account.' },
          { q: 'Which interest is exempt from state income tax?', options: ['Corporate bond interest', 'High-yield savings interest', 'US Treasury bill interest', 'Credit union savings interest'], answer: 2, explain: 'Interest on US Treasury securities is exempt from state and local income taxes, though it is federally taxable.' },
          { q: 'In a year with no capital gains, Maya has $5,000 of net capital losses. How much can she deduct against ordinary income this year?', options: ['$5,000', '$3,000, with $2,000 carried forward', '$0, losses are never deductible', '$1,000'], answer: 1, explain: 'Net capital losses can offset up to $3,000 of ordinary income per year (for most filers). The rest carries forward.' },
          { q: 'Why might a municipal bond make less sense for Maya, who earns very little, than for a high earner?', options: ['Munis are illegal for minors', 'Munis pay no interest at all', 'Munis can only be bought in an IRA', 'The tax break is worth little if her tax rate is already low'], answer: 3, explain: 'Munis usually pay lower yields in exchange for the tax break. If you pay little tax, you give up yield and gain almost nothing.' },
        ] },
      ],
    },
    // ------------------------------------------------------------------ 8
    {
      id: 'money-5-scams-and-traps',
      title: "Grizz's Guide to Passive Income Scams",
      summary: 'Ponzi schemes, pump-and-dumps, rug pulls, pig butchering, fake apps and course sellers, plus a red-flag checklist and how to check anyone selling investments.',
      minutes: 16,
      icon: 'warning',
      steps: [
        { type: 'read', title: 'Grizz takes the mic', html: `<p>Here is a pattern worth memorizing. When someone wants your money, the words they reach for most are <strong>"passive income."</strong></p>
<p>It makes sense. Everything you learned in this chapter says real passive income is slow, takes capital or upfront work, and comes with risk. Scammers sell the version without any of that: <span class="hl">big money, fast, no effort, no risk</span>. It is the most tempting promise in finance, which is exactly why it is the best bait.</p>
<p>Scams do not only catch gullible people. They catch smart, busy, lonely, hopeful and stressed people, including doctors, engineers and finance professionals. The best defense is not being smart. It is knowing the playbook, so the moves look familiar when they show up.</p>
<p>So in this lesson, the bear runs the class.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "My job is to be the friend who asks the annoying questions. Today I ask all of them." } },
        { type: 'read', title: 'Ponzi schemes: robbing Peter to pay Paul', html: `<p>A <span class="term" data-def="A fraud that pays earlier investors with money from newer investors, instead of from real profits.">Ponzi scheme</span> pays "returns" to early investors using money from new investors. There is no real business, or the business is too small to matter. It works only while new money keeps flowing in faster than people ask for withdrawals.</p>
<p>It is named after <strong>Charles Ponzi</strong>, who in 1920 promised 50% returns in 45 days from a scheme involving international postal reply coupons. It collapsed within months.</p>
<p>The biggest known Ponzi scheme was run by <strong>Bernie Madoff</strong>, a respected Wall Street figure and former chairman of the Nasdaq stock market. For decades he reported steady, unusually smooth returns, with almost no losing months, even during rough markets. When the 2008 financial crisis triggered a wave of withdrawal requests, the scheme collapsed. Client statements had shown about <strong>$65 billion</strong>, much of it fictional gains. Madoff was sentenced to 150 years in prison and died there in 2021.</p>
<p>Notice the red flag: <span class="hl">returns that were too consistent</span>. Real investments wobble.</p>`,
          sprite: { who: 'grizz', mood: 'think', say: "Madoff's numbers were not too high. They were too smooth. Real markets have bad months. Fake ones do not." } },
        { type: 'diagram', name: 'ponzi', caption: 'New investors\' money flows up to pay earlier investors. When new money slows or withdrawals spike, there is nothing underneath, and the whole thing collapses.' },
        { type: 'check', question: 'Which feature most strongly suggests a Ponzi scheme?', options: ['Returns that go up and down with the market', 'Steady high returns every month no matter what markets do, with a secret strategy', 'A fund that publishes its holdings and fees', 'An account held at a large, registered brokerage in your name'], answer: 1, explain: 'Smooth, high returns plus a strategy nobody can explain or verify is the classic Ponzi signature. Real returns are bumpy and real funds are transparent.' },
        { type: 'read', title: 'Pump-and-dumps and paid hype', html: `<p>In a <strong>pump-and-dump</strong>, promoters quietly buy a cheap, thinly traded stock or crypto token, then hype it in chat groups, forums and social media. As followers rush in, the price spikes. The promoters sell into the buying, and the price collapses, leaving the late buyers holding the bag.</p>
<p>A cousin of this is the <strong>finfluencer</strong> who is secretly paid to promote. US law requires anyone paid to promote a security to disclose it. In 2022, Kim Kardashian agreed to pay the SEC $1.26 million to settle charges that she promoted a crypto token on Instagram without disclosing she had been paid $250,000 for the post.</p>
<p>Even when a promotion is disclosed, ask the simple question: <span class="hl">who makes money if I buy this?</span> If the answer is "the person telling me to buy it," weigh their opinion accordingly. Hype, countdown timers and "get in before it moons" are pressure, not analysis.</p>` },
        { type: 'read', title: 'Rug pulls and fake trading apps', html: `<p>A <strong>crypto rug pull</strong> happens when the creators of a new token or project hype it, attract buyers, then drain the money or dump their huge stash of tokens and disappear. In 2021, a token named after a hit TV show soared to stunning heights, and then its creators vanished with millions while holders discovered they could not sell.</p>
<p>A <strong>fake trading app or website</strong> looks like a real brokerage or crypto exchange, sometimes copying real brand names. Your "account" shows deposits growing beautifully. But the numbers are just pixels. Your money went straight to the scammers on day one.</p>
<p>The giveaway comes when you try to withdraw. Suddenly there is a "tax," a "verification fee" or a "release deposit" required first. Real platforms do not make you send new money to get your own money out. Any fee you pay simply disappears too.</p>
<p>Only use firms you can verify independently, and reach them by typing their address yourself or using the official app store listing from their real website, never a link someone sent you.</p>` },
        { type: 'read', title: 'Pig butchering: the long con', html: `<p>The ugly name comes from a phrase used by the scammers themselves: fatten the pig before the slaughter. It goes like this:</p>
<ol>
<li><strong>Contact.</strong> A "wrong number" text, a dating app match, or a friendly stranger on social media.</li>
<li><strong>Trust.</strong> Weeks or months of chatting. They are kind, attentive, successful and often attractive.</li>
<li><strong>The tip.</strong> They casually mention making great money with crypto or trading, and offer to show you their platform.</li>
<li><strong>The hook.</strong> You start small. The fake app shows big gains. They might even let you withdraw a little to build trust.</li>
<li><strong>The slaughter.</strong> You invest more, sometimes borrowing money. Then withdrawals are blocked, fees are demanded, and your "friend" disappears.</li>
</ol>
<p>The FBI has reported investment fraud, much of it involving crypto, as the costliest category of internet crime complaints in recent years, with billions of dollars lost. Many of these operations are run by organized crime groups, and some of the people sending the messages are trafficking victims forced to work in scam compounds.</p>`,
          sprite: { who: 'grizz', mood: 'warn', say: "Someone you have never met in person wants to teach you to invest? That is not romance. That is a sales funnel." } },
        { type: 'truefalse', statement: 'If a trading platform let you withdraw a small amount once, it must be legitimate.', answer: false, explain: 'Letting victims withdraw a little early on is a deliberate trust-building tactic. The money for that payout often came from the victim or from other victims.' },
        { type: 'read', title: 'Guaranteed returns and course sellers', html: `<p>Outside of insured bank deposits and US government debt, <strong>no real investment guarantees a high return</strong>. Watch how fast "modest" promises turn impossible. A "guaranteed 2% a week" sounds small. Compounded for a year, it would turn $1,000 into about $2,800. Nothing legitimate does that reliably.</p>
<p>Then there are <strong>trading-course sellers</strong>. Dev paid $1,500 for a course from a guy with a rented supercar in every video. The pitch: learn his secret strategy and quit your job. Ask yourself why someone with a money machine would rather sell lessons. Often the course, the paid signal group and the referral links to brokers <em>are</em> the business.</p>
<p>Studies of day traders in several countries have found that most lose money over time. Real education exists, often free from regulators, libraries and nonprofits. Paid hype rarely comes with honest numbers, audited results or real risk warnings.</p>` },
        { type: 'numeric', question: 'A promoter promises "only 2% a week, compounded." If that were true for 52 weeks, what would the total gain be for the year, in percent? Round to the nearest whole number.', answer: 180, tolerance: 3, unit: '%', explain: '1.02 to the 52nd power is about 2.80, so $1 becomes $2.80, a gain of about 180% in one year. That is far beyond what any legitimate investment can promise.' },
        { type: 'callout', variant: 'warn', title: "Grizz's red-flag checklist", html: `<ul>
<li>Guaranteed or unusually high returns with "no risk."</li>
<li>Returns that are suspiciously smooth, month after month.</li>
<li>Pressure to act now: "limited spots," countdowns, "do not tell anyone."</li>
<li>A secret or too-complicated-to-explain strategy.</li>
<li>Payment by crypto, wire, gift cards or payment apps to a person.</li>
<li>Fees or taxes required before you can withdraw.</li>
<li>Someone you met online steering you to a specific platform.</li>
<li>Rewards for recruiting friends and family.</li>
<li>The seller or firm is not registered, or will not say where they are registered.</li>
</ul><p>One flag means slow down. Two or more means walk away.</p>` },
        { type: 'match', prompt: 'Match each scam to its signature move.', pairs: [
          { left: 'Ponzi scheme', right: 'Pays old investors with new investors\' money' },
          { left: 'Pump-and-dump', right: 'Hype a cheap asset, then sell into the rush' },
          { left: 'Rug pull', right: 'Token creators drain the funds and vanish' },
          { left: 'Pig butchering', right: 'Builds a fake relationship, then pushes a fake platform' },
          { left: 'Fake trading app', right: 'Shows growing balances but charges fees to withdraw' },
        ] },
        { type: 'read', title: 'How to check anyone selling investments', html: `<p>Before you hand anyone money, spend five minutes checking. It is free.</p>
<ul>
<li><strong>FINRA BrokerCheck:</strong> look up brokers and brokerage firms. See if they are registered, where they have worked, and any disciplinary history or customer complaints.</li>
<li><strong>SEC Investment Adviser Public Disclosure:</strong> look up investment advisers and their firms. The SEC's Investor.gov site has a search tool that covers both brokers and advisers.</li>
<li><strong>SEC EDGAR:</strong> look up a company's official filings. A "company" with no filings and huge promises deserves serious doubt.</li>
<li><strong>Your state securities regulator</strong> can also check people and offerings.</li>
</ul>
<p>Not registered? That alone is a major red flag for anyone selling investments. Even registered people can behave badly, so read the record, not just the checkmark.</p>
<p>If you think you have been targeted, stop sending money and report it: the FBI's Internet Crime Complaint Center (IC3), the FTC, the SEC and your bank. Watch out for "recovery services" that promise to get your money back for a fee. That is often a second scam aimed at the same victims.</p>` },
        { type: 'check', question: 'A friendly "adviser" Leo met online offers to manage his savings. What is the best first step?', options: ['Send a small test amount to see if it works', 'Ask the adviser for screenshots of their past returns', 'Look the person and firm up on FINRA BrokerCheck and the SEC adviser search', 'Check how many followers they have'], answer: 2, explain: 'Registration records are independent and free. Test deposits, screenshots and follower counts can all be faked or used to hook you.' },
        { type: 'read', title: 'The honest version wins', html: `<p>Here is everything this chapter taught, in one breath. Real passive income runs on capital or upfront work. Interest and bonds pay you to lend. Dividends and REITs share real profits and rents. Index funds grow slowly and can eventually fund a paycheck. Taxes take a cut, and smart account choices shrink it. And none of it is fast, guaranteed or free of risk.</p>
<p>Every scam in this lesson works by promising the opposite. So the best scam detector is simply knowing what real looks like. When a pitch sounds better than everything you learned here, that gap is the warning.</p>
<p>Maya, Leo and Ms. Ortiz will build their engines the slow way. Dev, after a rough year and a $1,500 course, is finally setting up automatic deposits into an index fund. Boring. Real. Passive.</p>`,
          sprite: { who: 'chip', mood: 'happy', say: "Slow and real beats fast and fake. Every single time it has been tested." } },
        { type: 'quiz', questions: [
          { q: 'What made Bernie Madoff\'s reported returns a red flag in hindsight?', options: ['They were extremely smooth, with almost no losing months', 'They were lower than the stock market', 'They were published every day', 'They were audited by a major firm'], answer: 0, explain: 'Real investments go up and down. Madoff\'s unusually steady returns were a sign the numbers were invented.' },
          { q: 'Your "investment" app shows big gains, but asks you to pay a 20% "tax" before withdrawing. What is most likely happening?', options: ['A normal IRS withholding process', 'A routine broker fee', 'A sign your account is extra profitable', 'A fake platform trying to take more of your money'], answer: 3, explain: 'Legitimate brokers do not demand new payments before releasing your own money. Any fee you send will be lost too.' },
          { q: 'Which tool lets you check whether a broker is registered and has disciplinary history?', options: ['A social media verified badge', 'FINRA BrokerCheck', 'The app store rating', 'The broker\'s own testimonials page'], answer: 1, explain: 'BrokerCheck is a free, independent database run by FINRA. Badges, ratings and testimonials can be bought or faked.' },
          { q: 'In a pump-and-dump, who usually loses the most money?', options: ['The promoters who bought early', 'The exchange', 'Followers who buy after the hype starts', 'People who never bought'], answer: 2, explain: 'Promoters sell into the buying frenzy. Late buyers are left holding the asset when the price collapses.' },
          { q: 'Why is "passive income" such popular scam bait?', options: ['It promises what people want most: money without time, effort or risk', 'It is a legal term only scammers can use', 'Regulators do not allow real investments to pay income', 'It is guaranteed by the government'], answer: 0, explain: 'Real passive income is slow and takes capital or work. Scammers sell the fantasy version, which is why the phrase is such effective bait.' },
        ] },
      ],
    },
  ],
  bossQuestions: [
    { q: 'Interest rates jump sharply. Which holding would most likely see the biggest price drop?', options: ['A high-yield savings account', 'A 4-week Treasury bill', 'A fund of 20-year Treasury bonds', 'A 6-month CD held to maturity'], answer: 2, explain: 'Longer duration means more sensitivity to rate changes. Savings balances do not change price, and very short bills barely move.' },
    { q: 'Leo wants about $1,500 a month in retirement income using the 4% rule as a rough guide. About how big a portfolio does that suggest?', options: ['$180,000', '$375,000', '$600,000', '$450,000'], answer: 3, explain: '$1,500 x 12 = $18,000 a year. $18,000 x 25 (the same as dividing by 4%) = $450,000. It is a rule of thumb, not a guarantee.' },
    { q: 'A stock now shows a 14% dividend yield after its price fell 60%, and its payout ratio is 180%. What is the most likely story?', options: ['The dividend may be at risk of a cut, a classic yield trap', 'The company is extremely profitable', 'The stock is guaranteed to recover', 'The high yield means the company is safe'], answer: 0, explain: 'The yield rose because the price crashed, and paying out 180% of earnings is not sustainable for long. A sky-high yield is often a warning.' },
    { q: 'Maya sells fund shares at a gain in a regular taxable account. Which holding period gets long-term capital gains treatment under US rules?', options: ['Exactly 12 months or less', 'More than one year', 'Any period, as long as she reinvests', 'More than 30 days'], answer: 1, explain: 'Long-term treatment requires holding more than one year. One year or less is short-term and taxed like ordinary income.' },
    { q: 'An online friend you never met in person shows you an app where your "investment" grew 40% in a month, then says you must pay a fee before withdrawing. What is the best move?', options: ['Pay the fee, since the gains cover it', 'Invest more first to reach a bonus tier', 'Stop sending money, try to verify the platform independently, and report it', 'Ask the friend to lend you the fee'], answer: 2, explain: 'Fake balances plus withdrawal fees are the signature of a pig-butchering scam. More money only deepens the loss. Report it to the FBI IC3 or FTC and your bank.' },
    { q: 'Which statement about REITs is accurate?', options: ['They must distribute at least 90% of taxable income, so most of their dividends are taxed as ordinary income rather than at qualified rates', 'They are banned from paying dividends', 'Their dividends are always tax-free', 'They only own mortgages, never buildings'], answer: 0, explain: 'The 90% distribution rule is why REITs pay large dividends. Most REIT dividends are not qualified dividends, so they are generally taxed at ordinary rates, although a special deduction may reduce the bill.' },
  ],
};
