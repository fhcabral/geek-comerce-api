import { Module } from '@nestjs/common';
import { typeormConfig } from './infra/db/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authentication/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './modules/app.controller';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { PaymentsModule } from './modules/payments/payments.module';

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
    AuthModule,
    ProductsModule,
    SalesModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
