import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

publicApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const publicDisclosureApi = {
  getDisclosure: (communityId: string | number = 1) =>
    publicApi.get(`/public/disclosure/${communityId}`),

  downloadEvidence: (id: number) =>
    publicApi.get(`/public/evidence/${id}/download`, { responseType: 'blob' }),

  verifyHash: (data: string, expectedHash: string) =>
    publicApi.get('/public/hash/verify', { params: { data, expectedHash } }),

  submitFeedback: (data: { content: string; contactInfo?: string; anonymous: boolean }) =>
    publicApi.post('/public/feedback', data),
};

export const authApiService = {
  login: (username: string, password: string) =>
    publicApi.post('/auth/login', { username, password }),

  register: (data: { username: string; password: string; name: string; role?: string; communityId?: number }) =>
    publicApi.post('/auth/register', data),

  getProfile: () =>
    authApi.get('/auth/me'),
};

export const serviceRecordApi = {
  create: (data: {
    title: string;
    description?: string;
    category: string;
    communityId: number;
    staffName: string;
    staffPhone?: string;
    startTime?: Date;
    location?: string;
    createdBy: string;
    imageUrl?: string;
  }) => authApi.post('/service-records', data),

  getAll: (params: {
    communityId?: number;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => authApi.get('/service-records', { params }),

  getToday: (communityId: number) =>
    authApi.get(`/service-records/today/${communityId}`),

  getStats: (communityId: number) =>
    authApi.get(`/service-records/stats/${communityId}`),

  getById: (id: number) =>
    authApi.get(`/service-records/${id}`),

  update: (id: number, data: {
    title?: string;
    description?: string;
    status?: string;
    endTime?: Date;
    notes?: string;
    imageUrl?: string;
  }) => authApi.put(`/service-records/${id}`, data),

  complete: (id: number, notes?: string) =>
    authApi.put(`/service-records/${id}/complete`, { notes }),

  delete: (id: number) =>
    authApi.delete(`/service-records/${id}`),
};

export const ledgerApi = {
  getAll: (params: {
    communityId?: number;
    type?: string;
    page?: number;
    limit?: number;
  }) => authApi.get('/ledger', { params }),

  create: (data: {
    type: string;
    category: string;
    amount: number;
    occurredAt: Date;
    communityId: number;
    counterparty?: string;
    description?: string;
    evidenceUrl?: string;
    createdBy: string;
  }) => authApi.post('/ledger', data),

  update: (id: number, data: {
    category?: string;
    amount?: number;
    counterparty?: string;
    description?: string;
    evidenceUrl?: string;
  }) => authApi.put(`/ledger/${id}`, data),

  delete: (id: number) =>
    authApi.delete(`/ledger/${id}`),
};

export const disclosureApi = {
  getAll: (params: {
    communityId?: number;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => authApi.get('/disclosure', { params }),

  create: (data: {
    title: string;
    content?: string;
    type: string;
    communityId: number;
    createdBy: string;
    scheduledAt?: Date;
    attachmentUrls?: string[];
  }) => authApi.post('/disclosure', data),

  update: (id: number, data: {
    title?: string;
    content?: string;
    type?: string;
    scheduledAt?: Date;
    isPinned?: boolean;
    attachmentUrls?: string[];
  }) => authApi.put(`/disclosure/${id}`, data),

  publish: (id: number) =>
    authApi.put(`/disclosure/${id}/publish`),

  archive: (id: number) =>
    authApi.put(`/disclosure/${id}/archive`),

  delete: (id: number) =>
    authApi.delete(`/disclosure/${id}`),
};

export const inquiryApi = {
  getAll: (params: {
    communityId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => authApi.get('/inquiry', { params }),

  create: (data: {
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    communityId: number;
  }) => authApi.post('/inquiry', data),

  reply: (id: number, data: {
    replyContent: string;
    repliedBy: string;
  }) => authApi.put(`/inquiry/${id}/reply`, data),

  close: (id: number) =>
    authApi.put(`/inquiry/${id}/close`),
};

export default publicApi;
