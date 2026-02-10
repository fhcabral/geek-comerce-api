import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshRepository: Repository<RefreshTokenEntity>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { password: _pw, ...safe } = user as any;
    return safe;
  }
  
  async login(user: { id: string; email: string; role?: string }) {
    console.log(user)
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  private async signAccessToken(user: { id: string; email: string; role?: string }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload);
  }

  private async issueRefreshToken(userId: string) {
    const days = Number(process.env.REFRESH_EXPIRES_DAYS ?? 7);
    const raw = randomBytes(48).toString('base64url');
    const tokenHash = await bcrypt.hash(raw, 12);

    const entity = this.refreshRepository.create({
      userId,
      tokenHash,
      expiresAt: daysFromNow(days),
      revokedAt: null,
    });
    await this.refreshRepository.save(entity);
    return `${entity.id}.${raw}`;
  }

  async refresh(refreshToken: string) {
    const [id, raw] = refreshToken.split('.', 2);
    if (!id || !raw) throw new UnauthorizedException('Invalid refresh token');

    const stored = await this.refreshRepository.findOne({ where: { id } });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    if (stored.revokedAt) throw new UnauthorizedException('Refresh token revoked');
    if (stored.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');

    const ok = await bcrypt.compare(raw, stored.tokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');

    stored.revokedAt = new Date();
    await this.refreshRepository.save(stored);

    const user = await this.usersService.findOne(stored.userId);
    const accessToken = await this.signAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = await this.issueRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const [id] = refreshToken.split('.', 1);
    if (!id) return;

    const stored = await this.refreshRepository.findOne({ where: { id } });
    if (!stored || stored.revokedAt) return;

    stored.revokedAt = new Date();
    await this.refreshRepository.save(stored);
  }
}
