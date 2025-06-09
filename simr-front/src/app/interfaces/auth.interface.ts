// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   roles: string[];
// }

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
//   roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  message?: string;
}

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

export interface LoginCredentials {
  username: string;
  password: string;
}