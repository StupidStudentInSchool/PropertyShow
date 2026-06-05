import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping(): any {
    return { code: 0, message: 'success', data: 'pong', timestamp: Date.now() };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }): Promise<any> {
    const result = await this.authService.login(body.username, body.password);
    if (result) {
      return {
        token: result.access_token,
        username: result.username,
        role: result.role
      };
    }
    throw new Error('用户名或密码错误');
  }

  @Get('me')
  async getProfile(@Headers('authorization') authHeader: string): Promise<any> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('未授权');
    }
    
    const token = authHeader.substring(7);
    const payload = await this.authService.validateToken(token);
    
    if (payload) {
      return {
        id: payload.sub,
        username: payload.username,
        role: payload.role
      };
    }
    throw new Error('token无效');
  }
}