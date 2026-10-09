// Names that lesson content is allowed to reference. The frontend implements one
// renderer per name (frontend/js/lessons/diagrams.js, widgets.js, sprites.js), so
// anything not listed here would render as a blank box.

export const ICONS = [
  'coin', 'bank', 'piggy', 'chart', 'candle', 'bull', 'bear', 'shield', 'clock', 'rocket',
  'scale', 'globe', 'card', 'house', 'briefcase', 'lightbulb', 'target', 'trophy', 'fire',
  'gem', 'calculator', 'book', 'lock', 'leaf', 'oil', 'wheat', 'gold', 'bolt', 'warning', 'receipt',
];

export const DIAGRAMS = [
  // money / banking / markets
  'money-flow', 'bank-lending', 'fed-rates', 'payment-rails', 'inflation-basket', 'compound-curve',
  'risk-ladder', 'diversification', 'asset-classes', 'account-types', 'market-sessions',
  'trade-lifecycle', 'order-book', 'bull-bear', 'bond-seesaw', 'dividend-flow', 'ponzi',
  // stocks
  'ipo-path', 'stock-split', 'income-statement', 'balance-sheet', 'cash-flow', 'moat',
  'margin-of-safety', 'candlestick-anatomy', 'trends', 'support-resistance', 'moving-averages',
  'rsi-zones', 'macd', 'bollinger', 'volume', 'chart-patterns', 'position-sizing',
  // options
  'call-payoff', 'put-payoff', 'moneyness', 'intrinsic-extrinsic', 'greeks', 'time-decay',
  'covered-call', 'protective-put', 'vertical-spread', 'straddle', 'iron-condor', 'iv-crush',
  // futures
  'futures-contract', 'hedger-speculator', 'mark-to-market', 'contango-backwardation',
  'basis-convergence', 'rollover', 'futures-sessions',
];

export const WIDGETS = [
  'compound-interest', 'rule-of-72', 'inflation', 'budget', 'emergency-fund', 'credit-card-payoff',
  'market-clock', 'dca', 'dividend-income', 'bid-ask', 'pe-ratio', 'intrinsic-value',
  'position-size', 'risk-reward', 'candle-builder', 'option-payoff', 'option-chain',
  'theta-decay', 'futures-leverage', 'margin-call',
];

export const SPRITES = ['chip', 'grizz', 'hoot', 'penny', 'bolt'];
export const MOODS = ['happy', 'think', 'wow', 'warn'];
export const CALLOUT_VARIANTS = ['tip', 'warn', 'fact', 'example', 'myth'];
