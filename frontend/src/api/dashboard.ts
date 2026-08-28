import { apiClient } from './client';
import type {
  CountryMetric,
  Customer,
  DashboardOverview,
  PageResult,
  ProductMetric,
  ProductReviewMetric,
  Review,
  ReviewSummary,
} from '../types/api';

export interface CustomerQueryParams {
  search?: string;
  segment?: string;
  country?: string;
  high_value?: boolean;
  page?: number;
  page_size?: number;
}

export interface ProductQueryParams {
  search?: string;
  sort?: 'revenue' | 'quantity_sold' | 'return_rate' | 'order_frequency';
  descending?: boolean;
  page?: number;
  page_size?: number;
}

export interface ReviewQueryParams {
  product_id?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  verified?: boolean;
  page?: number;
  page_size?: number;
}

export interface ReviewProductsQueryParams {
  category?: string;
  sort?: 'review_count' | 'average_rating' | 'positive_pct' | 'fake_rate' | 'verified_pct';
  page?: number;
  page_size?: number;
}

export const dashboardApi = {
  // Overview
  async getOverview(): Promise<DashboardOverview> {
    return apiClient<DashboardOverview>('/dashboard/overview');
  },

  // Customers
  async getCustomers(params: CustomerQueryParams = {}): Promise<PageResult<Customer>> {
    return apiClient<PageResult<Customer>>('/dashboard/customers', {
      params: {
        search: params.search,
        segment: params.segment,
        country: params.country,
        high_value: params.high_value,
        page: params.page || 1,
        page_size: params.page_size || 25,
      },
    });
  },

  async getCustomerDetail(customerId: string): Promise<Customer> {
    return apiClient<Customer>(`/dashboard/customers/${encodeURIComponent(customerId)}`);
  },

  // Products
  async getProducts(params: ProductQueryParams = {}): Promise<PageResult<ProductMetric>> {
    return apiClient<PageResult<ProductMetric>>('/dashboard/products', {
      params: {
        search: params.search,
        sort: params.sort || 'revenue',
        descending: params.descending !== undefined ? params.descending : true,
        page: params.page || 1,
        page_size: params.page_size || 25,
      },
    });
  },

  async getProductDetail(stockCode: string): Promise<ProductMetric> {
    return apiClient<ProductMetric>(`/dashboard/products/${encodeURIComponent(stockCode)}`);
  },

  // Countries
  async getCountries(): Promise<CountryMetric[]> {
    return apiClient<CountryMetric[]>('/dashboard/countries');
  },

  // Reviews
  async getReviewsSummary(): Promise<ReviewSummary> {
    return apiClient<ReviewSummary>('/dashboard/reviews/summary');
  },

  async getReviews(params: ReviewQueryParams = {}): Promise<PageResult<Review>> {
    return apiClient<PageResult<Review>>('/dashboard/reviews', {
      params: {
        product_id: params.product_id,
        sentiment: params.sentiment,
        verified: params.verified,
        page: params.page || 1,
        page_size: params.page_size || 25,
      },
    });
  },

  async getReviewProducts(params: ReviewProductsQueryParams = {}): Promise<PageResult<ProductReviewMetric>> {
    return apiClient<PageResult<ProductReviewMetric>>('/dashboard/reviews/products', {
      params: {
        category: params.category,
        sort: params.sort || 'review_count',
        page: params.page || 1,
        page_size: params.page_size || 25,
      },
    });
  },
};
