import { User } from '../models/user.model';

export { User };

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
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface AuthVerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokenInfo?: {
      expiresIn: number;
    };
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthStateExtended extends AuthState {
  isInitialized: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ---- Doble factor de autenticación (TOTP) ----

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data?: {
    secret?: string;
    otpauthUri?: string;
    backupCodes?: string[];
    twoFactorEnabled?: boolean;
  };
}

export interface TwoFactorStatusResponse {
  success: boolean;
  message: string;
  data: {
    twoFactorEnabled: boolean;
  };
}

export interface LoginResponseData {
  user?: User;
  tokenInfo?: {
    expiresIn: number;
  };
  requiresTwoFactor?: boolean;
}
