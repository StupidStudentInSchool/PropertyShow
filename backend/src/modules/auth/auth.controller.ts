import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UserRole } from '../../entities/user.entity';

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
          name: result.name,
          role: result.role,
          communityId: result.communityId,
        },
      };
    }
    return { code: -1, message: '用户名或密码错误' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Headers('authorization') authHeader: string): Promise<any> {
    const token = authHeader.substring(7);
    const payload = await this.authService.validateToken(token);
    
    if (payload) {
      return {
        code: 0,
        message: 'success',
        data: {
          id: payload.sub,
          username: payload.username,
          name: payload.name,
          role: payload.role,
          communityId: payload.communityId,
        },
      };
    }
    return { code: -1, message: 'token无效' };
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string; name: string; role?: UserRole; communityId?: number }) {
    const user = await this.authService.register({
      username: body.username,
      password: body.password,
      name: body.name,
      role: body.role || UserRole.OWNER,
      communityId: body.communityId,
    });
    return {
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }
}
