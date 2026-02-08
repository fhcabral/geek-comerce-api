import { Module } from '@nestjs/common';
import { typeormConfig } from './infra/db/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authentication/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './modules/app.controller';

@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeormConfig()), 
    HealthModule, 
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
