-- Enable RLS
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.country_metrics enable row level security;
alter table public.product_metrics enable row level security;

alter table public.review_products enable row level security;
alter table public.sellers enable row level security;
alter table public.reviews enable row level security;
alter table public.review_trends enable row level security;
alter table public.product_review_metrics enable row level security;

-- Remove existing policies if present
drop policy if exists "authenticated users can read customers" on public.customers;
drop policy if exists "authenticated users can read products" on public.products;
drop policy if exists "authenticated users can read transactions" on public.transactions;
drop policy if exists "authenticated users can read country metrics" on public.country_metrics;
drop policy if exists "authenticated users can read product metrics" on public.product_metrics;
drop policy if exists "authenticated users can read review products" on public.review_products;
drop policy if exists "authenticated users can read sellers" on public.sellers;
drop policy if exists "authenticated users can read reviews" on public.reviews;
drop policy if exists "authenticated users can read review trends" on public.review_trends;
drop policy if exists "authenticated users can read product review metrics" on public.product_review_metrics;

-- Authenticated read access
create policy "authenticated users can read customers"
on public.customers for select to authenticated using (true);

create policy "authenticated users can read products"
on public.products for select to authenticated using (true);

create policy "authenticated users can read transactions"
on public.transactions for select to authenticated using (true);

create policy "authenticated users can read country metrics"
on public.country_metrics for select to authenticated using (true);

create policy "authenticated users can read product metrics"
on public.product_metrics for select to authenticated using (true);

create policy "authenticated users can read review products"
on public.review_products for select to authenticated using (true);

create policy "authenticated users can read sellers"
on public.sellers for select to authenticated using (true);

create policy "authenticated users can read reviews"
on public.reviews for select to authenticated using (true);

create policy "authenticated users can read review trends"
on public.review_trends for select to authenticated using (true);

create policy "authenticated users can read product review metrics"
on public.product_review_metrics for select to authenticated using (true);
