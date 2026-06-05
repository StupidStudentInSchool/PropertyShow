import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  register: (data: { username: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),

  me: () => api.get('/auth/me'),
};

export const communityApi = {
  getAll: () => api.get('/community'),
  getOne: (id: number) => api.get(`/community/${id}`),
  create: (data: { name: string; address: string; contactPhone?: string; totalHouseholds?: number; description?: string }) =>
    api.post('/community', data),
  update: (id: number, data: { name?: string; address?: string; contactPhone?: string; totalHouseholds?: number; status?: string; description?: string }) =>
    api.put(`/community/${id}`, data),
  delete: (id: number) => api.delete(`/community/${id}`),
  toggleStatus: (id: number) => api.post(`/community/${id}/toggle-status`),
};

export const ledgerApi = {
  getAll: (communityId?: number) => 
    api.get('/ledger', { params: communityId ? { communityId } : {} }),
  getStatistics: (communityId?: number) => 
    api.get('/ledger/statistics', { params: communityId ? { communityId } : {} }),
  getRecent: (limit?: number, communityId?: number) =>
    api.get('/ledger/recent', { params: { limit, communityId } }),
  create: (data: { type: string; category: string; amount: number; counterparty: string; occurredAt: string; description?: string; evidenceUrl?: string; communityId: number; createdBy: string }) =>
    api.post('/ledger', data),
  update: (id: number, data: { type?: string; category?: string; amount?: number; counterparty?: string; occurredAt?: string; description?: string; evidenceUrl?: string }) =>
    api.put(`/ledger/${id}`, data),
  delete: (id: number) => api.delete(`/ledger/${id}`),
};

export const governanceApi = {
  createVote: (data: { title: string; description?: string; options: { text: string }[]; startDate: string; endDate: string; communityId: number; createdBy: string; isAnonymous?: boolean }) =>
    api.post('/governance/vote', data),
  getAllVotes: (communityId?: number) =>
    api.get('/governance/vote', { params: communityId ? { communityId } : {} }),
  getVote: (id: number) => api.get(`/governance/vote/${id}`),
  vote: (id: number, data: { optionId: number; voterId: string; voterName: string }) =>
    api.post(`/governance/vote/${id}/vote`, data),
  closeVote: (id: number) => api.post(`/governance/vote/${id}/close`),

  createInquiry: (data: { title: string; content: string; authorId: string; authorName: string; communityId: number }) =>
    api.post('/governance/inquiry', data),
  getAllInquiries: (communityId?: number, status?: string) =>
    api.get('/governance/inquiry', { params: { communityId, status } }),
  getInquiry: (id: number) => api.get(`/governance/inquiry/${id}`),
  replyInquiry: (id: number, data: { replyContent: string; repliedBy: string }) =>
    api.put(`/governance/inquiry/${id}/reply`, data),
  closeInquiry: (id: number) => api.post(`/governance/inquiry/${id}/close`),
  deleteInquiry: (id: number) => api.delete(`/governance/inquiry/${id}`),
};

export const disclosureApi = {
  getAll: (communityId?: number, type?: string, status?: string, page?: number, limit?: number) =>
    api.get('/disclosure', { params: { communityId, type, status, page, limit } }),
  getOne: (id: number) => api.get(`/disclosure/${id}`),
  create: (data: { title: string; content?: string; type: string; communityId: number; createdBy: string; scheduledAt?: string; attachmentUrls?: string[] }) =>
    api.post('/disclosure', data),
  update: (id: number, data: { title?: string; content?: string; type?: string; scheduledAt?: string; isPinned?: boolean; attachmentUrls?: string[] }) =>
    api.put(`/disclosure/${id}`, data),
  delete: (id: number) => api.delete(`/disclosure/${id}`),
  publish: (id: number) => api.post(`/disclosure/${id}/publish`),
  archive: (id: number) => api.post(`/disclosure/${id}/archive`),
  incrementView: (id: number) => api.post(`/disclosure/${id}/view`),
};

export const auditApi = {
  getAll: (module?: string, action?: string, userId?: string, page?: number, limit?: number) =>
    api.get('/audit', { params: { module, action, userId, page, limit } }),
  getStatistics: () => api.get('/audit/statistics'),
};

export default api;
