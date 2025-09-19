import { apiClient } from './client';
import { ApiResponse } from '@donedep/shared';

export interface EmailService {
  id: string;
  userId: string;
  domain: string;
  status: 'PENDING' | 'ACTIVE' | 'FAILED';
  dkimPublicKey?: string;
  spfRecord?: string;
  dmarcRecord?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED' | 'FAILED';
  templateId?: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  recentActivity: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  }>;
}

export interface SendEmailData {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface DomainSetupData {
  domain: string;
  subdomain?: string;
  enableDKIM?: boolean;
  enableSPF?: boolean;
  enableDMARC?: boolean;
}

export const nativeEmailApi = {
  // Setup email domain
  setupDomain: async (data: DomainSetupData): Promise<ApiResponse<EmailService>> => {
    const response = await apiClient.post('/native-email/setup-domain', data);
    return response.data;
  },

  // Get email services
  getEmailServices: async (): Promise<ApiResponse<EmailService[]>> => {
    const response = await apiClient.get('/native-email/services');
    return response.data;
  },

  // Send email
  sendEmail: async (data: SendEmailData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/native-email/send', data);
    return response.data;
  },

  // Get email templates
  getTemplates: async (): Promise<ApiResponse<EmailTemplate[]>> => {
    const response = await apiClient.get('/native-email/templates');
    return response.data;
  },

  // Create email template
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmailTemplate>> => {
    const response = await apiClient.post('/native-email/templates', template);
    return response.data;
  },

  // Update email template
  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<ApiResponse<EmailTemplate>> => {
    const response = await apiClient.put(`/native-email/templates/${id}`, template);
    return response.data;
  },

  // Delete email template
  deleteTemplate: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/native-email/templates/${id}`);
    return response.data;
  },

  // Get email campaigns
  getCampaigns: async (): Promise<ApiResponse<EmailCampaign[]>> => {
    const response = await apiClient.get('/native-email/campaigns');
    return response.data;
  },

  // Create email campaign
  createCampaign: async (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt' | 'sentCount' | 'deliveredCount' | 'openCount' | 'clickCount' | 'bounceCount'>): Promise<ApiResponse<EmailCampaign>> => {
    const response = await apiClient.post('/native-email/campaigns', campaign);
    return response.data;
  },

  // Start email campaign
  startCampaign: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/native-email/campaigns/${id}/start`);
    return response.data;
  },

  // Pause email campaign
  pauseCampaign: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/native-email/campaigns/${id}/pause`);
    return response.data;
  },

  // Get email analytics
  getAnalytics: async (serviceId?: string, period?: string): Promise<ApiResponse<EmailAnalytics>> => {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId;
    if (period) params.period = period;
    const response = await apiClient.get('/native-email/analytics', { params });
    return response.data;
  },

  // Get DNS records for domain setup
  getDnsRecords: async (domain: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/native-email/dns-records/${domain}`);
    return response.data;
  },

  // Verify domain setup
  verifyDomain: async (domain: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/native-email/verify-domain/${domain}`);
    return response.data;
  },

  // Handle unsubscribe
  unsubscribe: async (token: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/native-email/unsubscribe', { token });
    return response.data;
  },

  // Get suppression list
  getSuppressionList: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/native-email/suppression-list');
    return response.data;
  },

  // Add to suppression list
  addToSuppressionList: async (email: string, reason: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/native-email/suppression-list', { email, reason });
    return response.data;
  },

  // Remove from suppression list
  removeFromSuppressionList: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/native-email/suppression-list/${email}`);
    return response.data;
  },
};
