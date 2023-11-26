export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  expiresIn: string;
}
