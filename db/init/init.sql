CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT now(),
  processor SMALLINT NOT NULL -- 0 = default, 1 = fallback
);

CREATE INDEX IF NOT EXISTS idx_payments_requested_at_processor
  ON payments (requested_at, processor);

  CREATE TABLE payment_summaries (
  processor SMALLINT NOT NULL,           -- 0 = default, 1 = fallback
  summary_date TIMESTAMP NOT NULL,            
  total_requests BIGINT DEFAULT 0,
  total_amount NUMERIC(18,2) DEFAULT 0,
  PRIMARY KEY (processor, summary_date)
);
