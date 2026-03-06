import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    // 1. Charger l'utilisateur avec le hash du mot de passe
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    // 2. Comparer le mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return null;
    }

    // 3. Retirer le passwordHash avant de retourner l'utilisateur
    const { passwordHash, ...result } = user;

    return result;
  }

  async login(user: any) {
    // 4. Création du payload JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}