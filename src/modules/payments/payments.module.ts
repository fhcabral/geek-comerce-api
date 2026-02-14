import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentEntity } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesEntity } from 'src/modules/sales/entities/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, SalesEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
