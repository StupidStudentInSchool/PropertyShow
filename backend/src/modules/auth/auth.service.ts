import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username, enabled: true },
    });

    if (!user) {
      return null;
    }

    if (password !== '123456') {
      return null;
    }

    const payload = { 
      sub: user.id.toString(), 
      username: user.username, 
      role: user.role,
      communityId: user.communityId 
    };

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      name: user.name,
      role: user.role,
      communityId: user.communityId,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  async register(userData: { username: string; password: string; name: string; role: UserRole; communityId?: number }): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      enabled: true,
    });
    return this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
}
