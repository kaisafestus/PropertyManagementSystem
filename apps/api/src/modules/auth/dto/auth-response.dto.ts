export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    role: string;
  };

  accessToken: string;
  refreshToken: string;
}
