import { apiClient } from './client';
import { ApiResponse } from '@donedep/shared';

export interface PaymentAccount {
  id: string;
  provider: 'STRIPE' | 'PAYPAL' | 'SQUARE';
  stripeAccountId?: string;
  accountType: 'EXPRESS' | 'STANDARD' | 'CUSTOM';
  status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'REJECTED';
  country: string;
  currency: string;
  businessType: 'INDIVIDUAL' | 'COMPANY' | 'NON_PROFIT' | 'GOVERNMENT_ENTITY';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  stripeAccountId: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  amount: number;
  currency: string;
  applicationFee?: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  description?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface CreateAccountData {
  country: string;
  businessType: 'INDIVIDUAL' | 'COMPANY' | 'NON_PROFIT' | 'GOVERNMENT_ENTITY';
  email?: string;
}

export interface PaymentIntentData {
  accountId: string;
  amount: number;
  currency: string;
  description?: string;
  applicationFee?: number;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  accountId: string;
  amount: number;
  currency: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  applicationFee?: number;
  metadata?: Record<string, string>;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionSize: number;
  monthlyVolume: Array<{
    month: string;
    volume: number;
    transactions: number;
  }>;
  topCountries: Array<{
    country: string;
    volume: number;
    percentage: number;
  }>;
}

export const stripeConnectApi = {
  // Create Express account
  createAccount: async (data: CreateAccountData): Promise<ApiResponse<PaymentAccount>> => {
    const response = await apiClient.post('/stripe-connect/create-account', data);
    return response.data;
  },

  // Get user's payment accounts
  getAccounts: async (): Promise<ApiResponse<PaymentAccount[]>> => {
    const response = await apiClient.get('/stripe-connect/accounts');
    return response.data;
  },

  // Get account status
  getAccountStatus: async (accountId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/stripe-connect/account/${accountId}/status`);
    return response.data;
  },

  // Create onboarding link
  createOnboardingLink: async (accountId: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await apiClient.post(`/stripe-connect/account/${accountId}/onboard`);
    return response.data;
  },

  // Get dashboard link
  getDashboardLink: async (accountId: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await apiClient.get(`/stripe-connect/account/${accountId}/dashboard`);
    return response.data;
  },

  // Create payment intent
  createPaymentIntent: async (data: PaymentIntentData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/stripe-connect/payment-intent', data);
    return response.data;
  },

  // Create checkout session
  createCheckoutSession: async (data: CheckoutSessionData): Promise<ApiResponse<{ url: string }>> => {
    const response = await apiClient.post('/stripe-connect/checkout-session', data);
    return response.data;
  },

  // Get payment analytics
  getAnalytics: async (accountId: string, period?: string): Promise<ApiResponse<PaymentAnalytics>> => {
    const params = period ? { period } : {};
    const response = await apiClient.get(`/stripe-connect/account/${accountId}/analytics`, { params });
    return response.data;
  },

  // Get supported countries
  getSupportedCountries: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/stripe-connect/supported-countries');
    return response.data;
  },

  // Get platform fees
  getPlatformFees: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/stripe-connect/platform-fees');
    return response.data;
  },
};
