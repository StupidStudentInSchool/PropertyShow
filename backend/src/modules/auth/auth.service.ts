import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(phone: string, password: string): Promise<any> {
    // TODO: 实现用户验证逻辑
    return { id: '1', phone, name: 'Test User' };
  }
}
