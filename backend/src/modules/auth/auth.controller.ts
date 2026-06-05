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
        code: 0, 
        message: 'success', 
        data: {
          token: result.access_token,
          username: result.username,
          role: result.role
        },
        timestamp: Date.now() 
      };
    }
    return { code: 1001, message: '用户名或密码错误', timestamp: Date.now() };
  }

  @Get('me')
  async getProfile(@Headers('authorization') authHeader: string): Promise<any> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { code: 1002, message: '未授权', timestamp: Date.now() };
    }
    
    const token = authHeader.substring(7);
    const payload = await this.authService.validateToken(token);
    
    if (payload) {
      return { 
        code: 0, 
        message: 'success', 
        data: {
          id: payload.sub,
          username: payload.username,
          role: payload.role
        },
        timestamp: Date.now() 
      };
    }
    return { code: 1003, message: 'token无效', timestamp: Date.now() };
  }
}