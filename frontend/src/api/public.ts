import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

publicApi.interceptors.response.use(
  (response) => {
    // 如果响应是 {code, message, data} 格式，直接返回 data
    if (response.data && response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
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

export default publicApi;
