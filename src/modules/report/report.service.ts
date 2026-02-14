import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { SalesEntity, SaleStatus } from '../sales/entities/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportSummary } from './types';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(SalesEntity)
    private readonly salesRepository: Repository<SalesEntity>,
    private readonly salesService: SalesService
  ) { }

  async getSummary(query: { from?: Date; to?: Date }): Promise<ReportSummary> {
  const { from, to } = query;

  const qb = this.salesRepository
    .createQueryBuilder('s')
    .select(`COALESCE(SUM(CASE WHEN s.status = :paid THEN s.total ELSE 0 END), 0)`, 'gross')
    .addSelect(`COUNT(CASE WHEN s.status = :paid THEN 1 END)`, 'paidCount')
    .addSelect(`COUNT(CASE WHEN s.status = :confirmed THEN 1 END)`, 'pendingCount')
    .setParameters({
      paid: SaleStatus.PAID,
      confirmed: SaleStatus.CONFIRMED,
    });

  if (from) qb.where('s.createdAt >= :from', { from });
  if (to) qb.andWhere('s.createdAt <= :to', { to });

  const queryResult = await qb.getRawOne();

  const gross = Number(queryResult.gross);
  const paidCount = Number(queryResult.paidCount);
  const pendingCount = Number(queryResult.pendingCount);
  const salesCount = paidCount;

  return {
    gross,
    salesCount,
    avgTicket: salesCount > 0 ? gross / salesCount : 0,
    paidCount,
    pendingCount,
  };
}

  async getSalesReport(query: PaginationQueryDto) {
    const sale = await this.salesService.findAll(query);
    return sale;
  }
}
