import { reactive } from 'vue';
import { authApi } from '../api';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  communityId?: number;
  createdAt: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const state = reactive<UserState>({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
});

export const useUserStore = () => {
  const login = async (username: string, password: string) => {
    state.isLoading = true;
    try {
      const response = await authApi.login(username, password);
      if (response.code === 0) {
        state.token = response.data.token;
        state.user = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } finally {
      state.isLoading = false;
    }
  };

  const logout = () => {
    state.user = null;
    state.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const initUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      state.user = JSON.parse(storedUser);
    }
  };

  const getMe = async () => {
    state.isLoading = true;
    try {
      const response = await authApi.me();
      if (response.code === 0) {
        state.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } finally {
      state.isLoading = false;
    }
  };

  return {
    state,
    login,
    logout,
    initUser,
    getMe,
  };
};
