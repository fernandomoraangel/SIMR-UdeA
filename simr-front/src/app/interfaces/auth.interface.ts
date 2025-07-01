export interface User {
  id: string;
  username: string;
  email: string;
  //   roles: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface AuthVerifyResponse {
  success: boolean;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
