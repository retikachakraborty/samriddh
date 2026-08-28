-- Samriddh initial database schema
-- Generated from the processed datasets produced by scripts/data_pipeline.py

create extension if not exists pgcrypto;

-- ============================================================
-- RETAIL ANALYTICS
-- ============================================================

create table if not exists public.customers (
    customer_id text primary key,
    country text,
    total_spend numeric(14,2) not null default 0,
    order_count integer not null default 0,
    units_purchased numeric(14,2) not null default 0,
    average_order_value numeric(14,2) not null default 0,
    first_purchase timestamptz,
    last_purchase timestamptz,
    recency integer,
    frequency integer,
    monetary_value numeric(14,2) not null default 0,
    r_score smallint,
    f_score smallint,
    m_score smallint,
    rfm_score text,
    rfm_segment text,
    retention_action text
);

create table if not exists public.products (
    stock_code text primary key,
    description text,
    revenue numeric(14,2) not null default 0,
    quantity_sold bigint not null default 0,
    order_frequency integer not null default 0,
    return_quantity bigint not null default 0,
    return_rate numeric(10,6) not null default 0,
    country text
);

create table if not exists public.transactions (
    id bigint generated always as identity primary key,
    invoice_no text not null,
    stock_code text,
    description text,
    quantity numeric(14,3),
    invoice_date timestamptz,
    unit_price numeric(14,4),
    customer_id text,
    country text,
    line_value numeric(14,4),
    absolute_line_value numeric(14,4),
    transaction_type text,
    is_return boolean not null default false,
    is_cancellation boolean not null default false,
    is_adjustment boolean not null default false,
    is_zero_price boolean not null default false,
    is_extreme_quantity boolean not null default false,
    customer_available boolean not null default false,
    year integer,
    month integer,
    day integer,
    day_of_week text,
    quarter integer
);

create table if not exists public.country_metrics (
    country text primary key,
    revenue numeric(14,2) not null default 0,
    order_count integer not null default 0,
    customer_count integer not null default 0,
    return_rate numeric(10,6) not null default 0
);

create table if not exists public.product_metrics (
    stock_code text primary key,
    description text,
    revenue numeric(14,2) not null default 0,
    quantity_sold bigint not null default 0,
    order_frequency integer not null default 0,
    return_quantity bigint not null default 0,
    return_rate numeric(10,6) not null default 0,
    country text
);

-- ============================================================
-- VOICE OF CUSTOMER
-- ============================================================

create table if not exists public.review_products (
    product_id text primary key,
    category text,
    price_usd numeric(12,2),
    true_quality numeric(10,4),
    seller_id text,
    is_prime boolean,
    num_images integer,
    bullet_points integer,
    has_video boolean,
    brand_tier text,
    days_on_platform integer,
    total_reviews integer,
    avg_rating numeric(4,2)
);

create table if not exists public.sellers (
    seller_id text primary key,
    seller_name text,
    fake_rate numeric(10,6)
);

create table if not exists public.reviews (
    review_id text primary key,
    product_id text not null,
    user_id text,
    review_date timestamptz,
    year integer,
    month integer,
    star_rating numeric(3,1),
    sentiment text,
    verified_purchase boolean,
    is_fake_review boolean,
    review_length_words integer,
    has_title boolean,
    title_word_count integer,
    num_images_attached integer,
    helpful_votes integer,
    total_votes integer,
    helpful_ratio numeric(10,6),
    days_since_purchase integer,
    reviewer_review_count integer,
    is_top_reviewer boolean,
    is_early_review boolean,
    exclamation_marks integer,
    all_caps_ratio numeric(10,6),
    readability_score numeric(10,4),
    category text,
    price_usd numeric(12,2),
    price_tier text,
    brand_tier text,
    seller_id text,
    seller_fake_rate numeric(10,6),
    sentiment_score numeric(10,6),
    quality_aspect text,
    shipping_aspect text,
    value_aspect text,
    service_aspect text,
    emotion text
);

create table if not exists public.review_trends (
    id bigint generated always as identity primary key,
    year integer,
    month integer,
    month_label text,
    review_count integer,
    average_rating numeric(4,2),
    positive_pct numeric(10,6),
    negative_pct numeric(10,6)
);

create table if not exists public.product_review_metrics (
    product_id text primary key,
    category text,
    review_count integer not null default 0,
    average_rating numeric(4,2),
    positive_pct numeric(10,6),
    negative_pct numeric(10,6),
    fake_rate numeric(10,6),
    verified_pct numeric(10,6),
    helpful_ratio numeric(10,6)
);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

alter table public.transactions
    add constraint transactions_customer_fk
    foreign key (customer_id)
    references public.customers(customer_id)
    on delete set null;

alter table public.transactions
    add constraint transactions_product_fk
    foreign key (stock_code)
    references public.products(stock_code)
    on delete set null;

alter table public.reviews
    add constraint reviews_product_fk
    foreign key (product_id)
    references public.review_products(product_id)
    on delete cascade;

alter table public.reviews
    add constraint reviews_seller_fk
    foreign key (seller_id)
    references public.sellers(seller_id)
    on delete set null;

alter table public.product_review_metrics
    add constraint product_review_metrics_product_fk
    foreign key (product_id)
    references public.review_products(product_id)
    on delete cascade;

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_transactions_invoice_date
    on public.transactions(invoice_date);

create index if not exists idx_transactions_customer
    on public.transactions(customer_id);

create index if not exists idx_transactions_product
    on public.transactions(stock_code);

create index if not exists idx_transactions_type
    on public.transactions(transaction_type);

create index if not exists idx_transactions_country
    on public.transactions(country);

create index if not exists idx_customers_segment
    on public.customers(rfm_segment);

create index if not exists idx_customers_country
    on public.customers(country);

create index if not exists idx_customers_monetary
    on public.customers(monetary_value desc);

create index if not exists idx_reviews_product
    on public.reviews(product_id);

create index if not exists idx_reviews_seller
    on public.reviews(seller_id);

create index if not exists idx_reviews_date
    on public.reviews(review_date);

create index if not exists idx_reviews_sentiment
    on public.reviews(sentiment);

create index if not exists idx_reviews_category
    on public.reviews(category);

create index if not exists idx_reviews_rating
    on public.reviews(star_rating);

create index if not exists idx_review_products_category
    on public.review_products(category);

-- ============================================================
-- BASIC DATA VALIDATION
-- ============================================================

alter table public.transactions
    add constraint transactions_type_check
    check (
        transaction_type in (
            'SALE',
            'RETURN',
            'CANCELLATION',
            'ADJUSTMENT',
            'OTHER'
        )
        or transaction_type is null
    );

alter table public.reviews
    add constraint reviews_sentiment_check
    check (
        sentiment in ('positive', 'negative', 'neutral')
        or sentiment is null
    );

alter table public.customers
    add constraint customers_rfm_score_check
    check (
        r_score between 1 and 5
        and f_score between 1 and 5
        and m_score between 1 and 5
        or r_score is null
    );

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

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

-- For the initial analytics application, authenticated users can read
-- analytical data. Writes will be performed through the backend/service role.

create policy "authenticated users can read customers"
    on public.customers for select
    to authenticated
    using (true);

create policy "authenticated users can read products"
    on public.products for select
    to authenticated
    using (true);

create policy "authenticated users can read transactions"
    on public.transactions for select
    to authenticated
    using (true);

create policy "authenticated users can read country metrics"
    on public.country_metrics for select
    to authenticated
    using (true);

create policy "authenticated users can read product metrics"
    on public.product_metrics for select
    to authenticated
    using (true);

create policy "authenticated users can read review products"
    on public.review_products for select
    to authenticated
    using (true);

create policy "authenticated users can read sellers"
    on public.sellers for select
    to authenticated
    using (true);

create policy "authenticated users can read reviews"
    on public.reviews for select
    to authenticated
    using (true);

create policy "authenticated users can read review trends"
    on public.review_trends for select
    to authenticated
    using (true);

create policy "authenticated users can read product review metrics"
    on public.product_review_metrics for select
    to authenticated
    using (true);

-- ============================================================
-- COMMENTS
-- ============================================================

comment on schema public is
    'Samriddh analytics database: retail intelligence and voice of customer data.';
