-- Stable source-row identity prevents rerunning the processed transaction CSV
-- from creating another copy of every row. The identity primary key remains
-- unchanged for backend compatibility.
alter table public.transactions
    add column if not exists source_row_number bigint;

create unique index if not exists idx_transactions_source_row_number
    on public.transactions(source_row_number);

comment on column public.transactions.source_row_number is
    '1-based row number in data/processed/transactions/transactions_cleaned.csv';
