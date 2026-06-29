import { axiosClient } from './axiosClient';

export const authService = {
  async register(name: string, email: string, password: string) {
    const response = await axiosClient.post('/auth/register', { fullName: name, email, password });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axiosClient.post('/auth/login', { email, password });
    const resData = response.data;
    if (resData.accessToken) {
      return {
        ...resData,
        token: resData.accessToken,
        user: {
          ...resData.user,
          name: resData.user.fullName
        }
      };
    }
    return resData;
  },

  async googleLogin(token: string) {
    const response = await axiosClient.post('/auth/google-login', { token });
    const resData = response.data?.data || response.data;
    if (resData.accessToken) {
      return {
        ...resData,
        token: resData.accessToken,
        user: {
          ...resData.user,
          name: resData.user.fullName
        }
      };
    }
    return resData;
  },

  async verifyOtp(email: string, otp: string) {
    const response = await axiosClient.post('/auth/verify-otp', { email, otp });
    const resData = response.data;
    if (resData.accessToken) {
      return {
        ...resData,
        token: resData.accessToken,
        user: {
          ...resData.user,
          name: resData.user.fullName
        }
      };
    }
    return resData;
  },

  async forgotPassword(email: string) {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const response = await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  async getProfile() {
    const response = await axiosClient.get('/auth/profile');
    return response.data;
  },

  async updateProfile(name: string, email: string) {
    const response = await axiosClient.put('/auth/profile', { name, email });
    return response.data;
  },

  async changePassword(password: string) {
    const response = await axiosClient.put('/auth/profile/password', { password });
    return response.data;
  }
};
