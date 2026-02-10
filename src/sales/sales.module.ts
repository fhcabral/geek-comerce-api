import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesEntity } from './entities/sale.entity';
import { SaleItemEntity } from './entities/sale-item.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

import { ProductsModule } from 'src/modules/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesEntity, SaleItemEntity]),
    ProductsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
