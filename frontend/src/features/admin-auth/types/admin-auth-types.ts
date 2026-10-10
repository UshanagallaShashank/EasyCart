// Request shape for creating a platform admin account.
export interface AdminRegisterPayload {
  username: string;
  email: string;
  password: string;
  passcode: string;
}
