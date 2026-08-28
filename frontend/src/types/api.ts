export interface AuthUser {
  id: string;
  email: string | null;
  role: string | null;
  is_demo?: boolean;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number | null;
}

export interface RevenueTrendPoint {
  year: number;
  month: number;
  revenue: number;
  orders?: number;
  order_count?: number;
  return_quantity?: number;
  cancellation_quantity?: number;
}

export type RevenueTrendMonth = RevenueTrendPoint;

export interface TopProductSummary {
  stock_code: string;
  description: string;
  revenue: number;
  quantity_sold: number;
  order_frequency: number;
  return_rate: number;
}

export interface TopCountrySummary {
  country: string;
  revenue: number;
  order_count: number;
  customer_count: number;
  return_rate: number;
}

export interface DashboardOverview {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  returns: number;
  cancellations: number;
  revenue_trends: RevenueTrendPoint[];
  top_products: TopProductSummary[];
  top_countries: TopCountrySummary[];
}

export interface Customer {
  customer_id: string;
  country: string;
  total_spend: number;
  order_count: number;
  units_purchased: number;
  average_order_value: number;
  first_purchase: string | null;
  last_purchase: string | null;
  recency: number;
  frequency: number;
  monetary_value: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_score: string;
  rfm_segment: string;
  retention_action: string | null;
}

export interface Product {
  stock_code: string;
  description: string;
  revenue: number;
  quantity_sold: number;
  order_frequency: number;
  return_quantity: number;
  return_rate: number;
  country?: string;
}

export type ProductMetric = Product;

export interface CountryMetric {
  country: string;
  revenue: number;
  order_count: number;
  customer_count: number;
  return_rate: number;
}

export interface AspectSentimentCounts {
  positive: number;
  negative: number;
}

export interface ReviewSummary {
  review_count: number;
  average_rating: number;
  positive_pct: number;
  negative_pct: number;
  fake_rate: number;
  verified_pct: number;
  helpful_ratio: number;
  aspects: {
    quality: AspectSentimentCounts;
    shipping: AspectSentimentCounts;
    value: AspectSentimentCounts;
    service: AspectSentimentCounts;
  };
  sentiment_trends: Array<{
    id?: number;
    year: number;
    month: number;
    month_label: string;
    review_count: number;
    average_rating: number;
    positive_pct: number;
    negative_pct: number;
  }>;
}

export interface Review {
  review_id: string;
  product_id: string;
  user_id: string;
  review_date: string;
  year?: number;
  month?: number;
  star_rating: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  verified_purchase: boolean;
  is_fake_review: boolean;
  review_length_words?: number;
  has_title?: boolean;
  title_word_count?: number;
  num_images_attached?: number;
  helpful_votes?: number;
  total_votes?: number;
  helpful_ratio?: number;
  days_since_purchase?: number;
  reviewer_review_count?: number;
  is_top_reviewer?: boolean;
  is_early_review?: boolean;
  readability_score?: number;
  category?: string;
  price_usd?: number;
  price_tier?: string;
  brand_tier?: string;
  seller_id?: string;
  seller_fake_rate?: number;
  sentiment_score?: number;
  quality_aspect?: 'positive' | 'negative' | 'neutral';
  shipping_aspect?: 'positive' | 'negative' | 'neutral';
  value_aspect?: 'positive' | 'negative' | 'neutral';
  service_aspect?: 'positive' | 'negative' | 'neutral';
  emotion?: string;
}

export interface ProductReviewMetric {
  product_id: string;
  category: string;
  review_count: number;
  average_rating: number;
  positive_pct: number;
  negative_pct: number;
  fake_rate: number;
  verified_pct: number;
  helpful_ratio: number;
}

// Priority Types
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type PriorityStatus = 'Open' | 'In Progress' | 'Completed' | 'Archived';
export type RelatedEntityType = 'customer' | 'product' | 'country' | 'review' | 'general';

export interface Priority {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority_level: PriorityLevel;
  status: PriorityStatus;
  related_entity_type?: RelatedEntityType | null;
  related_entity_id?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface PriorityCreate {
  title: string;
  description?: string;
  priority_level: PriorityLevel;
  status?: PriorityStatus;
  related_entity_type?: RelatedEntityType | null;
  related_entity_id?: string | null;
}

export interface PriorityUpdate {
  title?: string;
  description?: string;
  priority_level?: PriorityLevel;
  status?: PriorityStatus;
  related_entity_type?: RelatedEntityType | null;
  related_entity_id?: string | null;
  completed_at?: string | null;
}

// SAM Analytics Types
export interface SamAnalysisBlock {
  type: 'metrics' | 'chart' | 'table' | 'text' | 'recommendation' | 'lineage';
  title?: string;
  content?: string;
  metrics?: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    tone?: 'positive' | 'negative' | 'gold' | 'neutral';
  }>;
  chartData?: {
    type: 'area' | 'bar';
    data: Array<{ label: string; value: number; secondaryValue?: number }>;
    xKey: string;
    yKey: string;
  };
  tableData?: {
    columns: string[];
    rows: (string | number)[][];
  };
  recommendations?: Array<{
    title: string;
    priority: string;
    category: string;
    description: string;
    expectedImpact?: string;
  }>;
  dataLineage?: {
    sourceTables: string[];
    recordsAnalyzed: number;
    confidence: number;
    computedAt: string;
  };
}

export interface SamStatus {
  isConfigured: boolean;
  provider: string;
  model: string;
  requiredEnvVar: string;
  status: 'Connected' | 'Setup Required';
}

export interface SamMessage {
  id: string;
  type: 'user' | 'sam';
  timestamp: string;
  prompt?: string;
  text: string;
  analysisBlocks?: SamAnalysisBlock[];
  toolsUsed?: string[];
  llmStatus?: SamStatus;
}
