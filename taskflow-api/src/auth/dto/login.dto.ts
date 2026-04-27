import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com', description: 'Adresse email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe', writeOnly: true })
  password: string;
}
