import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SalesModule } from '../sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesEntity } from '../sales/entities/sale.entity';
import { SaleItemEntity } from '../sales/entities/sale-item.entity';

@Module({
  imports: [SalesModule, TypeOrmModule.forFeature([SalesEntity, SaleItemEntity])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
