import axios from 'axios';
import { user } from '../types/user';
import { UserResponse } from '../types/userResponse ';
import { UserLoginResponse } from '../types/userLoginResponse';

const API_URL = 'http://localhost:8020/api';

export const registerUser = async (userData: user): Promise<UserResponse> => {
  try {
    const response = await axios.post<UserResponse>(`${API_URL}/auth/registro`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials: { email: string; password: string }): Promise<UserLoginResponse> => {
  try {
    const response = await axios.post<UserLoginResponse>(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};