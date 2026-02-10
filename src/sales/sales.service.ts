import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { BaseService } from 'src/common/base-service';
import { SalesEntity } from './entities/sale.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaleItemEntity } from './entities/sale-item.entity';
import { SaleStatus } from './entities/sale.entity';
import { AddSaleItemDto } from './dto/add-sale-item.dto';
import { ProductsService } from 'src/modules/products/products.service';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
import { ProductEntity } from 'src/modules/products/entities/products.entity';

@Injectable()
export class SalesService extends BaseService<SalesEntity, CreateSaleDto, UpdateSaleDto> {
  constructor(
    @InjectRepository(SalesEntity)
    private readonly salesRepository: Repository<SalesEntity>,
    @InjectRepository(SaleItemEntity)
    private readonly saleItemRepository: Repository<SaleItemEntity>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {
    super(salesRepository);
  }

  private assertDraft(sale: SalesEntity) {
    if (sale.status !== SaleStatus.DRAFT) {
      throw new BadRequestException('Sale is not in DRAFT status');
    }
  }

  private toMoney(n: number) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  private parseMoney(s: string) {
    const n = Number(s);
    if (Number.isNaN(n)) return 0;
    return n;
  }

  async addItem(saleId: string, dto: AddSaleItemDto) {
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');
    this.assertDraft(sale);

    const product = await this.productsService.findOne(dto.productId);

    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice)) throw new BadRequestException('Invalid product price');

    const existing = await this.saleItemRepository.findOne({ where: { saleId, productId: dto.productId } });

    const quantity = (existing?.quantity ?? 0) + dto.quantity;
    const lineTotal = this.toMoney(unitPrice * quantity);

    if (existing) {
      existing.quantity = quantity;
      existing.lineTotal = lineTotal;
      return this.saleItemRepository.save(existing);
    }

    const item = this.saleItemRepository.create({
      saleId,
      productId: dto.productId,
      nameSnapshot: product.name,
      skuSnapshot: product.sku ?? null,
      unitPriceSnapshot: this.toMoney(unitPrice),
      quantity,
      lineTotal,
    });

    return this.saleItemRepository.save(item);
  }

  async updateItemQuantity(saleId: string, itemId: string, dto: UpdateSaleItemDto) {
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');
    this.assertDraft(sale);

    const item = await this.saleItemRepository.findOne({ where: { productId: itemId, saleId } });
    if (!item) throw new NotFoundException('Sale item not found');

    const unit = this.parseMoney(item.unitPriceSnapshot);
    item.quantity = dto.quantity;
    item.lineTotal = this.toMoney(unit * dto.quantity);

    return this.saleItemRepository.save(item);
  }

  async removeItem(saleId: string, itemId: string, dto: UpdateSaleItemDto) {
    console.log('Removing item:', { saleId, itemId, dto });
    const sale = await this.salesRepository.findOne({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');
    this.assertDraft(sale);

    const item = await this.saleItemRepository.findOne({ where: { productId: itemId, saleId } });
    if (!item) throw new NotFoundException('Sale item not found');

    const qty = dto.quantity;

    if (qty === undefined || qty === null) {
      return this.saleItemRepository.remove(item);
    }

    if (qty <= 0) throw new BadRequestException('quantity must be > 0');

    item.quantity -= qty;

    if (item.quantity <= 0) {
      return this.saleItemRepository.remove(item);
    }

    item.lineTotal = this.toMoney(this.parseMoney(item.unitPriceSnapshot) * item.quantity);
    return this.saleItemRepository.save(item);
  }

  async confirm(saleId: string) {
  return this.dataSource.transaction(async (manager) => {
    const salesRepository = manager.getRepository(SalesEntity);
    const productsRepository = manager.getRepository(ProductEntity);

    const sale = await salesRepository.findOne({
      where: { id: saleId },
      relations: { items: true },
    });

    if (!sale) throw new NotFoundException('Sale not found');
    this.assertDraft(sale);

    if (!sale.items?.length) throw new BadRequestException('Sale has no items');

    const totalNumber = sale.items.reduce((acc, it) => acc + this.parseMoney(it.lineTotal), 0);

    const warns = await this.productsService.adjustStockOnSaleConfirmation(sale.items, productsRepository);

    if (warns.length) {
      throw new BadRequestException({
        message: 'Cannot confirm sale due to stock issues',
        warns,
      });
    }

    sale.total = this.toMoney(totalNumber);
    sale.status = SaleStatus.CONFIRMED;

    await salesRepository.save(sale);

    return salesRepository.findOne({
      where: { id: sale.id },
      relations: { items: true },
    });
  })
}

  async cancel(saleId: string) {
  return this.dataSource.transaction(async (manager) => {
    const salesRepository = manager.getRepository(SalesEntity);
    const productsRepository = manager.getRepository(ProductEntity);

    const sale = await salesRepository.findOne({
      where: { id: saleId },
      relations: { items: true },
    });

    if (!sale) throw new NotFoundException('Sale not found');

    if (sale.status === SaleStatus.CANCELED) return sale;

    if (sale.status !== SaleStatus.CONFIRMED) {
      throw new BadRequestException('Only CONFIRMED sales can be canceled');
    }

    await this.productsService.adjustStockOnSaleCancel(sale.items, productsRepository);

    sale.status = SaleStatus.CANCELED;
    await salesRepository.save(sale);

    return salesRepository.findOne({
      where: { id: sale.id },
      relations: { items: true },
    });
  });
}
}
