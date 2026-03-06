import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // on utilise email au lieu de username
    });
  }

  async validate(email: string, password: string) {
    // 1. Vérifier les credentials via AuthService
    const user = await this.authService.validateUser(email, password);

    // 2. Si l'utilisateur n'existe pas ou mot de passe invalide
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3. Retourner l'utilisateur (sera attaché à req.user)
    return user;
  }
}
