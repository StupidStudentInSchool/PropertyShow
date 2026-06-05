import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string): Promise<any> {
    if ((username === 'admin' && password === '123456') || (username === 'property' && password === '123456')) {
      const payload = { sub: '1', username, role: 'property_staff' };
      return {
        access_token: this.jwtService.sign(payload),
        username,
        role: 'property_staff'
      };
    }
    return null;
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}