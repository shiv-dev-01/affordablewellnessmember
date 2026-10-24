import axios from 'axios';
import type { UserProfileResponse } from '../../types/user';
import { api } from './config';

import { storage } from '../../utils/storage';

export const getUserProfileData = async (userId: number): Promise<UserProfileResponse> => {
  try {
    const email = storage.getUserData()?.email;
    const response = await api.post('/user_details', {
      // user_id: userId,
      email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<any> => {
  try {
    const response = await api.post('/forgot_password', { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
