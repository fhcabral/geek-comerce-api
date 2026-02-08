import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import type { Response, Request } from 'express';
import { responseJson } from 'src/common/default-response';
import { ApiResponse } from 'src/common/types/api-response';
import { AuthResponseStatus } from './types';

function getRefreshToken(req: Request, bodyToken?: string) {
  return bodyToken || (req.cookies?.refresh_token ?? null);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponse<AuthResponseStatus>> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const userLogin = await this.authService.login(user);
    return responseJson(userLogin);
  }

  @Post('web/login')
  async webLogin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<AuthResponseStatus>> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const { accessToken, refreshToken } = await this.authService.login(user);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 7) * 24 * 60 * 60 * 1000,
    });

    return responseJson({ ok: true });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: Partial<RefreshDto>, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<AuthResponseStatus>> {
    const token = getRefreshToken(req, body.refreshToken);
    if (!token) return responseJson({ ok: false}, 'Missing refresh token');
    const { accessToken, refreshToken } = await this.authService.refresh(token);

    if (req.cookies?.refresh_token) { 
      const isProd = process.env.NODE_ENV === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
      });

      return responseJson({ ok: true });
    }

    return responseJson({ accessToken, refreshToken });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Body() body: Partial<RefreshDto>, @Res({ passthrough: true }) res: Response): Promise<ApiResponse<AuthResponseStatus>> {
    const token = getRefreshToken(req, body.refreshToken);
    if (token) await this.authService.logout(token);

    if (req.cookies?.refresh_token) {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    }

    return responseJson({ ok: true });
  }
}
