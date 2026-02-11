import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import { ApiResponse } from 'src/common/types/api-response';
import { responseJson } from 'src/common/default-response';
import { OwnerOnly } from 'src/modules/authentication/roles/owner-only.decorator';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post(':saleId/payments')
  @OwnerOnly()
  async createForSale(
    @Param('saleId', new ParseUUIDPipe()) saleId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<ApiResponse<PaymentEntity>> {
    const payment = await this.paymentsService.createForSale(saleId, dto);
    return responseJson(payment, 'Pagamento registrado com sucesso');
  }

  @Get(':saleId/payments')
  @OwnerOnly()
  async listBySale(
    @Param('saleId', new ParseUUIDPipe()) saleId: string,
  ): Promise<ApiResponse<PaymentEntity[]>> {
    const payments = await this.paymentsService.listBySale(saleId);
    return responseJson(payments, 'Pagamentos listados com sucesso');
  }

  @Put(':saleId/payments/:paymentId/cancel')
  @OwnerOnly()
  async cancel(
    @Param('saleId', new ParseUUIDPipe()) saleId: string,
    @Param('paymentId', new ParseUUIDPipe()) paymentId: string,
  ): Promise<ApiResponse<PaymentEntity>> {
    const payment = await this.paymentsService.cancelPayment(saleId, paymentId);
    return responseJson(payment, 'Pagamento cancelado com sucesso');
  }

}
