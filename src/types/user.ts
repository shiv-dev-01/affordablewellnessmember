export interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  dob: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  status: number;
  message: string;
  user_details: UserDetails;
}
