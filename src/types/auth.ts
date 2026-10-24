export interface LoginResponse {
  status: number;
  message: string;
  token?: string;
  login_token?: string;
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  patientId?: string;
  existing?: number;
  gender?: string;
  error_code?: string;
  password?: string;
  must_change_password?: number | boolean;
  month?: string;
  day?: string;
  year?: string;
}

export interface PortalLoginUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  must_change_password?: number | boolean;
  token?: string;
  patientId?: string;
  gender?: string;
  existing?: number;
  password?: string;
}

export interface PortalLoginWithTokenResponse {
  status: number;
  message?: string;
  data?: PortalLoginUser;
}

export interface UserData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  patientId?: string;
  gender?: string;
  existing?: number;
}