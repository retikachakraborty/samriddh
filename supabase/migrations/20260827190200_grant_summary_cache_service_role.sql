-- Keep the existing administrative/service-role access contract consistent for
-- the additive summary cache table. The backend itself uses authenticated JWTs.
grant select on public.retail_monthly_metrics to service_role;
