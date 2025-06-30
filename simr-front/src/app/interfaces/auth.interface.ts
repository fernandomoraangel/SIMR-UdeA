export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   roles: string[];
// }

// export interface AuthResponse {
//   accessToken: string;
//   user: User;
//   message?: string;
// }
