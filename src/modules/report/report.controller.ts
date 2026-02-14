import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiResponse } from 'src/common/types/api-response';
import { responseJson } from 'src/common/default-response';
import { OwnerOnly } from 'src/modules/authentication/roles/owner-only.decorator';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { ReportSummary } from './types';
import { SalesEntity } from '../sales/entities/sale.entity';

@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService,) { }
  
  @Get('/summary')
  @OwnerOnly()
  async summary(@Query() query: PaginationQueryDto): Promise<ApiResponse<ReportSummary>> {
    const payment = await this.reportService.getSummary(query);
    return responseJson(payment);
  }

  @Get('/history')
  @OwnerOnly()
  async getSalesHistory(
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<SalesEntity[] | PaginatedResponse<SalesEntity>>> {
    const report = await this.reportService.getSalesReport(query);
    return responseJson(report);
  }
}
