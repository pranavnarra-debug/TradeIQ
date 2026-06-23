-- TradeIQ Database Schema
-- PostgreSQL 14+

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verify_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  portfolio_type VARCHAR(10) CHECK (portfolio_type IN ('manual', 'ai')),
  name VARCHAR(100),
  starting_capital DECIMAL(15,2) DEFAULT 50000.00,
  cash DECIMAL(15,2) DEFAULT 50000.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  side VARCHAR(5) CHECK (side IN ('long', 'short')),
  quantity INTEGER NOT NULL,
  entry_price DECIMAL(10,4) NOT NULL,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  strategy VARCHAR(50),
  is_open BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  action VARCHAR(4) CHECK (action IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  order_type VARCHAR(6) CHECK (order_type IN ('market', 'limit')),
  strategy VARCHAR(50),
  reasoning TEXT,
  realized_pnl DECIMAL(10,4),
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_number INTEGER CHECK (lesson_number BETWEEN 1 AND 20),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  UNIQUE(user_id, lesson_number)
);

CREATE TABLE IF NOT EXISTS user_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  trend_assessment VARCHAR(20),
  support_level DECIMAL(10,4),
  resistance_level DECIMAL(10,4),
  canslim_checks JSONB,
  verdict VARCHAR(5),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  socket_id VARCHAR(100),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS admin_metrics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  active_users INTEGER,
  total_users INTEGER,
  total_trades INTEGER,
  total_lessons_completed INTEGER
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_portfolio ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_positions_open ON positions(portfolio_id, is_open);
CREATE INDEX IF NOT EXISTS idx_trades_portfolio ON trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_user ON user_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
