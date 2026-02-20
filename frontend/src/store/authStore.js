import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },



      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.forgotPassword(email);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to send OTP',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.verifyOtp(email, otp);
          set({ isLoading: false });
          return { success: true, resetToken: response.data.data };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'OTP verification failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.resetPassword(data);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Password reset failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.updateProfile(data);
          set({
            user: response.data.data,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Update failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      fetchProfile: async () => {
        if (!get().token) return;
        try {
          const response = await userAPI.getProfile();
          set({ user: response.data.data });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      isAdmin: () => {
        const user = get().user;
        if (!user || !user.roles) return false;
        return user.roles.some(role => ['ADMIN', 'MANAGER', 'STAFF'].includes(role));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
