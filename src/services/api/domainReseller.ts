import { apiClient } from './client';
import { ApiResponse } from '@donedep/shared';

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
  premium: boolean;
}

export interface DomainInfo {
  domain: string;
  registrar: string;
  createdDate: string;
  expiryDate: string;
  status: string;
  nameservers: string[];
  whoisPrivacy: boolean;
}

export interface DomainRegistrationData {
  domain: string;
  years: number;
  contacts: {
    registrant: ContactInfo;
    admin: ContactInfo;
    tech: ContactInfo;
    billing: ContactInfo;
  };
  nameservers?: string[];
  whoisPrivacy?: boolean;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export const domainResellerApi = {
  // Search for available domains
  searchDomains: async (query: string, tlds?: string[]): Promise<ApiResponse<DomainSearchResult[]>> => {
    const response = await apiClient.post('/domain-reseller/search', { query, tlds });
    return response.data;
  },

  // Get domain pricing
  getDomainPricing: async (tlds?: string[]): Promise<ApiResponse<any>> => {
    const params = tlds ? { tlds: tlds.join(',') } : {};
    const response = await apiClient.get('/domain-reseller/pricing', { params });
    return response.data;
  },

  // Register a domain
  registerDomain: async (data: DomainRegistrationData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/domain-reseller/register', data);
    return response.data;
  },

  // Get user's domains
  getUserDomains: async (): Promise<ApiResponse<DomainInfo[]>> => {
    const response = await apiClient.get('/domain-reseller/user-domains');
    return response.data;
  },

  // Get domain information
  getDomainInfo: async (domain: string): Promise<ApiResponse<DomainInfo>> => {
    const response = await apiClient.get(`/domain-reseller/${domain}/info`);
    return response.data;
  },

  // Update nameservers
  setNameservers: async (domain: string, nameservers: string[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/domain-reseller/${domain}/nameservers`, { nameservers });
    return response.data;
  },

  // Get DNS records
  getDnsRecords: async (domain: string): Promise<ApiResponse<DNSRecord[]>> => {
    const response = await apiClient.get(`/domain-reseller/${domain}/dns`);
    return response.data;
  },

  // Update DNS records
  setDnsRecords: async (domain: string, records: DNSRecord[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/domain-reseller/${domain}/dns`, { records });
    return response.data;
  },

  // Renew domain
  renewDomain: async (domain: string, years: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/domain-reseller/${domain}/renew`, { years });
    return response.data;
  },

  // Toggle WHOIS privacy
  setWhoisPrivacy: async (domain: string, enabled: boolean): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/domain-reseller/${domain}/whois-privacy`, { enabled });
    return response.data;
  },
};
