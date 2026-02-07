import { Module } from '@nestjs/common';
import { typeormConfig } from './infra/db/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeormConfig()), 
    HealthModule, 
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
