
export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  provider: string;
  providerId?: string;
  providerData?: any;
  created?: Date;
  refreshTokens: string[];
  fullName?: string;
}

// export interface User {
//   id?: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   username: string;
//   password?: string;
//   salt?: string;
//   provider: string;
//   providerId?: string;
//   providerData?: any;
//   created?: Date;
//   fullName?: string;
// }
