import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  @Cron('0 3 * * *')
  async cleanup() {
    const now = new Date();

    const expired = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(now),
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revoked = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('revoked_at IS NOT NULL')
      .andWhere('revoked_at < :date', { date: sevenDaysAgo })
      .execute();

    this.logger.log(
      `Refresh cleanup → expired: ${expired.affected ?? 0}, revoked: ${revoked.affected ?? 0}`,
    );
  }

  async onModuleInit() {
    await this.cleanup();
  }
}
