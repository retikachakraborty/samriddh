-- Backend API support. Additive only; existing data and pipeline are untouched.
grant select on public.customers, public.products, public.transactions,
    public.country_metrics, public.product_metrics, public.review_products,
    public.sellers, public.reviews, public.review_trends,
    public.product_review_metrics to authenticated;

create or replace function public.dashboard_overview()
returns jsonb language sql stable security invoker set search_path = public as $$
with sales as (
    select coalesce(sum(line_value) filter (where transaction_type = 'SALE'), 0) revenue,
        count(distinct invoice_no) filter (where transaction_type = 'SALE') orders,
        coalesce(sum(abs(quantity)) filter (where is_return), 0) returned_units,
        coalesce(sum(abs(quantity)) filter (where is_cancellation), 0) cancelled_units
    from public.transactions
), monthly as (
    select year, month, coalesce(sum(line_value) filter (where transaction_type = 'SALE'), 0) revenue,
        count(distinct invoice_no) filter (where transaction_type = 'SALE') orders
    from public.transactions group by year, month order by year, month
), top_products as (
    select coalesce(jsonb_agg(to_jsonb(p) order by p.revenue desc), '[]'::jsonb) value
    from (select stock_code, description, revenue, quantity_sold, order_frequency, return_rate
          from public.product_metrics order by revenue desc nulls last limit 10) p
), top_countries as (
    select coalesce(jsonb_agg(to_jsonb(c) order by c.revenue desc), '[]'::jsonb) value
    from (select country, revenue, order_count, customer_count, return_rate
          from public.country_metrics order by revenue desc nulls last limit 10) c
)
select jsonb_build_object('total_revenue', s.revenue, 'total_orders', s.orders,
    'total_customers', (select count(*) from public.customers),
    'total_products', (select count(*) from public.products), 'returns', s.returned_units,
    'cancellations', s.cancelled_units,
    'revenue_trends', coalesce((select jsonb_agg(to_jsonb(m)) from monthly m), '[]'::jsonb),
    'top_products', tp.value, 'top_countries', tc.value)
from sales s cross join top_products tp cross join top_countries tc;
$$;

create or replace function public.review_summary()
returns jsonb language sql stable security invoker set search_path = public as $$
with stats as (
    select count(*) review_count, coalesce(avg(star_rating), 0) average_rating,
        coalesce(avg((sentiment = 'positive')::int), 0) positive_pct,
        coalesce(avg((sentiment = 'negative')::int), 0) negative_pct,
        coalesce(avg(is_fake_review::int), 0) fake_rate,
        coalesce(avg(verified_purchase::int), 0) verified_pct,
        coalesce(avg(helpful_ratio), 0) helpful_ratio from public.reviews
), aspects as (
    select jsonb_build_object(
        'quality', jsonb_build_object('positive', count(*) filter (where quality_aspect = 'positive'), 'negative', count(*) filter (where quality_aspect = 'negative')),
        'shipping', jsonb_build_object('positive', count(*) filter (where shipping_aspect = 'positive'), 'negative', count(*) filter (where shipping_aspect = 'negative')),
        'value', jsonb_build_object('positive', count(*) filter (where value_aspect = 'positive'), 'negative', count(*) filter (where value_aspect = 'negative')),
        'service', jsonb_build_object('positive', count(*) filter (where service_aspect = 'positive'), 'negative', count(*) filter (where service_aspect = 'negative'))
    ) value from public.reviews
)
select jsonb_build_object('review_count', s.review_count, 'average_rating', s.average_rating,
    'positive_pct', s.positive_pct, 'negative_pct', s.negative_pct, 'fake_rate', s.fake_rate,
    'verified_pct', s.verified_pct, 'helpful_ratio', s.helpful_ratio,
    'sentiment_trends', coalesce((select jsonb_agg(to_jsonb(t) order by t.year, t.month) from public.review_trends t), '[]'::jsonb),
    'aspects', a.value) from stats s cross join aspects a;
$$;

grant execute on function public.dashboard_overview() to authenticated;
grant execute on function public.review_summary() to authenticated;
