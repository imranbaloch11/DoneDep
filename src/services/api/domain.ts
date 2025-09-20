import { apiClient } from './client';

interface DomainAvailability {
  domain: string;
  available: boolean;
  price: number;
  premium: boolean;
}

interface DomainSuggestion {
  domain: string;
  available: boolean;
  price: number;
  type: 'exact' | 'prefix' | 'suffix';
}

interface RegistrantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

interface CheckAvailabilityRequest {
  domains: string[];
}

interface CheckAvailabilityResponse {
  success: boolean;
  data?: {
    domains: DomainAvailability[];
    timestamp: string;
  };
  message?: string;
}

interface GetSuggestionsRequest {
  keyword: string;
  tlds?: string[];
}

interface GetSuggestionsResponse {
  success: boolean;
  data?: {
    keyword: string;
    suggestions: DomainSuggestion[];
    timestamp: string;
  };
  message?: string;
}

interface RegisterDomainRequest {
  domain: string;
  years?: number;
  registrant: RegistrantInfo;
  tech?: RegistrantInfo;
  admin?: RegistrantInfo;
  billing?: RegistrantInfo;
  nameservers?: string[];
}

interface RegisterDomainResponse {
  success: boolean;
  data?: {
    domain: string;
    registrationId: string;
    status: string;
    expirationDate: string;
    nameservers: string[];
    autoRenew: boolean;
    cost: number;
  };
  message?: string;
}

interface DomainInfoResponse {
  success: boolean;
  data?: {
    domain: string;
    registered: boolean;
    registrar: string;
    creationDate: string;
    expirationDate: string;
    nameservers: string[];
    status: string;
    autoRenew: boolean;
  };
  message?: string;
}

interface ConfigureDNSRequest {
  domain: string;
  records: DNSRecord[];
}

interface ConfigureDNSResponse {
  success: boolean;
  data?: {
    domain: string;
    records: Array<DNSRecord & { id: string; status: string }>;
    propagationTime: string;
    timestamp: string;
  };
  message?: string;
}

export const domainApi = {
  async checkAvailability(data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> {
    const response = await apiClient.post<CheckAvailabilityResponse>('/domain/check', data);
    return response.data;
  },

  async getSuggestions(data: GetSuggestionsRequest): Promise<GetSuggestionsResponse> {
    const response = await apiClient.post<GetSuggestionsResponse>('/domain/suggestions', data);
    return response.data;
  },

  async registerDomain(data: RegisterDomainRequest): Promise<RegisterDomainResponse> {
    const response = await apiClient.post<RegisterDomainResponse>('/domain/register', data);
    return response.data;
  },

  async getDomainInfo(domain: string): Promise<DomainInfoResponse> {
    const response = await apiClient.get<DomainInfoResponse>(`/domain/info/${domain}`);
    return response.data;
  },

  async configureDNS(data: ConfigureDNSRequest): Promise<ConfigureDNSResponse> {
    const response = await apiClient.post<ConfigureDNSResponse>('/domain/dns', data);
    return response.data;
  },
};
