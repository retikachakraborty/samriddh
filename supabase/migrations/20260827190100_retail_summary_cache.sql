-- Persist the expensive retail aggregation once, so dashboard requests never scan
-- the raw transaction table. Existing source rows are not changed or reimported.
create table if not exists public.retail_monthly_metrics (
    year integer not null,
    month integer not null,
    revenue numeric(14,2) not null default 0,
    order_count bigint not null default 0,
    return_quantity numeric(14,3) not null default 0,
    cancellation_quantity numeric(14,3) not null default 0,
    primary key (year, month)
);

insert into public.retail_monthly_metrics (year, month, revenue, order_count, return_quantity, cancellation_quantity)
select year, month,
    coalesce(sum(line_value) filter (where transaction_type = 'SALE'), 0),
    count(distinct invoice_no) filter (where transaction_type = 'SALE'),
    coalesce(sum(abs(quantity)) filter (where is_return), 0),
    coalesce(sum(abs(quantity)) filter (where is_cancellation), 0)
from public.transactions
where year is not null and month is not null
group by year, month
on conflict (year, month) do update set
    revenue = excluded.revenue, order_count = excluded.order_count,
    return_quantity = excluded.return_quantity, cancellation_quantity = excluded.cancellation_quantity;

alter table public.retail_monthly_metrics enable row level security;
drop policy if exists "authenticated users can read retail monthly metrics" on public.retail_monthly_metrics;
create policy "authenticated users can read retail monthly metrics"
on public.retail_monthly_metrics for select to authenticated using (true);
grant select on public.retail_monthly_metrics to authenticated;

create or replace function public.dashboard_overview()
returns jsonb language sql stable security invoker set search_path = public as $$
with totals as (
    select coalesce(sum(revenue), 0) revenue, coalesce(sum(order_count), 0) orders,
        coalesce(sum(return_quantity), 0) returned_units,
        coalesce(sum(cancellation_quantity), 0) cancelled_units
    from public.retail_monthly_metrics
), top_products as (
    select coalesce(jsonb_agg(to_jsonb(p) order by p.revenue desc), '[]'::jsonb) value
    from (select stock_code, description, revenue, quantity_sold, order_frequency, return_rate
          from public.product_metrics order by revenue desc nulls last limit 10) p
), top_countries as (
    select coalesce(jsonb_agg(to_jsonb(c) order by c.revenue desc), '[]'::jsonb) value
    from (select country, revenue, order_count, customer_count, return_rate
          from public.country_metrics order by revenue desc nulls last limit 10) c
)
select jsonb_build_object('total_revenue', t.revenue, 'total_orders', t.orders,
    'total_customers', (select count(*) from public.customers),
    'total_products', (select count(*) from public.products), 'returns', t.returned_units,
    'cancellations', t.cancelled_units,
    'revenue_trends', coalesce((select jsonb_agg(to_jsonb(m) order by m.year, m.month) from public.retail_monthly_metrics m), '[]'::jsonb),
    'top_products', p.value, 'top_countries', c.value)
from totals t cross join top_products p cross join top_countries c;
$$;
