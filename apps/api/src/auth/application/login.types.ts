export type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  newUserCreated?: boolean;
  linkedToExistingUser?: boolean;
};
