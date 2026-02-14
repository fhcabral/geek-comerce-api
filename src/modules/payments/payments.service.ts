import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { BaseService } from 'src/common/base-service';
import { SalesEntity, SaleStatus } from '../sales/entities/sale.entity';

@Injectable()
export class PaymentsService extends BaseService<PaymentEntity, CreatePaymentDto, UpdatePaymentDto> {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,

    @InjectRepository(SalesEntity)
    private readonly salesRepository: Repository<SalesEntity>,
  ) {
    super(paymentsRepository);
  }

  async createForSale(saleId: string, dto: CreatePaymentDto): Promise<PaymentEntity> {
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    if (sale.status === SaleStatus.DRAFT) {
      throw new BadRequestException('Cannot pay a DRAFT sale');
    }
    if (sale.status === SaleStatus.CANCELED) {
      throw new BadRequestException('Cannot pay a CANCELED sale');
    }

    const payment = this.paymentsRepository.create({
      saleId,
      method: dto.method,
      amount: dto.amount as any,
      status: PaymentStatus.PAID,
      paidAt: dto.paidAt ?? new Date(),
    });

    const saved = await this.paymentsRepository.save(payment);

    await this.recalcSalePaymentStatus(saleId);

    return saved;
  }

  async listBySale(saleId: string): Promise<PaymentEntity[]> {
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    return this.paymentsRepository.find({
      where: { saleId },
      order: { createdAt: 'ASC' as any },
    });
  }

  async cancelPayment(saleId: string, paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findOne({ where: { id: paymentId, saleId } });
    if (!payment) throw new NotFoundException('Payment not found for this sale');

    if (payment.status === PaymentStatus.CANCELED) return payment;

    payment.status = PaymentStatus.CANCELED;
    const saved = await this.paymentsRepository.save(payment);

    await this.recalcSalePaymentStatus(saleId);

    return saved;
  }

  async recalcSalePaymentStatus(saleId: string): Promise<void> {
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');

    if (sale.status === SaleStatus.CANCELED || sale.status === SaleStatus.DRAFT) return;

    const payments = await this.paymentsRepository.find({
      where: { saleId, status: PaymentStatus.PAID },
    });

    const paidTotal = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const saleTotal = Number(sale.total);

    const nextStatus = paidTotal >= saleTotal ? SaleStatus.PAID : SaleStatus.CONFIRMED;

    if (sale.status !== nextStatus) {
      sale.status = nextStatus;
      await this.salesRepository.save(sale);
    }
  }
}
