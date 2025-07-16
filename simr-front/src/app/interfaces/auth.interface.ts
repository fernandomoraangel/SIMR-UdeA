export interface User {
  id: string;
  username: string;
  email: string;
  //   roles: string[];
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    tokenInfo?: {
      expiresIn: number;
    };
    redirectUrl?: string; // URL to redirect after signup, if applicable
  };
}
// export interface SignupResponse {
//   success: boolean;
//   message: string;
//   data: {
//     user?: User;
//     tokens?: {
//       accessToken: string;
//       expiresIn: number;
//     };
//     redirectUrl?: string; // URL to redirect after signup, if applicable
//   };
// }

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    tokenInfo?: {
      expiresIn: number;
    };
  };
}
// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   data: {
//     user?: User;
//     tokens?: {
//       accessToken: string;
//       expiresIn: number;
//     };
//   };
// }

export interface AuthVerifyResponse {
  success: boolean;
  message: string;
  data: {
  user: User;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
// export interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   accessToken: string | null;
// }

export interface LoginCredentials {
  username: string;
  password: string;
}
