export interface JwtPayload {
  sub: string;
  email: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
}
