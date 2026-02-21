import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindManyOptions, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { DataSource } from 'typeorm';

import { ProductEntity } from './entities/products.entity';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { BaseService } from 'src/common/base-service';
import { ProductImageEntity } from './entities/product-image.entity';
import { GcsStorageService } from '../storage/gcs-storage.service';
import { SaleItemEntity } from 'src/modules/sales/entities/sale-item.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService extends BaseService<ProductEntity, CreateProductDto, UpdateProductDto> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,

    @InjectRepository(ProductImageEntity)
    private readonly productsImagesRepository: Repository<ProductImageEntity>,

    private readonly storage: GcsStorageService,
    private readonly dataSource: DataSource
  ) {
    super(productsRepository);
  }

  async findAll(
    query?: PaginationQueryDto,
  ): Promise<ProductEntity[] | PaginatedResponse<ProductEntity>> {
    if (!query) {
      return this.repository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.images", "img")
        .orderBy("p.createdAt", "DESC")
        .addOrderBy("img.position", "ASC")
        .getMany();
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const sortMap: Record<string, string> = {
      createdAt: "p.createdAt",
      updatedAt: "p.updatedAt",
      name: "p.name",
      sku: "p.sku",
      price: "p.price",
      stock: "p.stock",
    };

    const sortKey = query.sort && sortMap[query.sort] ? query.sort : "createdAt";
    const sortColumn = sortMap[sortKey];
    const order = (query.order ?? "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const baseQb = this.repository.createQueryBuilder("p");

    if (query.search) {
      const s = String(query.search).trim();
      baseQb.andWhere(
        `(p.name ILIKE :q${isUUID(s) ? " OR p.id = :id" : ""})`,
        {
          q: `%${s}%`,
          ...(isUUID(s) ? { id: s } : {}),
        },
      );
    }

    if (query.from && query.to) {
      baseQb.andWhere("p.createdAt BETWEEN :from AND :to", {
        from: query.from,
        to: query.to,
      });
    } else if (query.from) {
      baseQb.andWhere("p.createdAt >= :from", { from: query.from });
    } else if (query.to) {
      baseQb.andWhere("p.createdAt <= :to", { to: query.to });
    }

    const total = await baseQb.getCount();

    const idRows = await baseQb
      .clone()
      .select("p.id", "id")
      .orderBy(sortColumn, order as "ASC" | "DESC")
      .addOrderBy("p.id", "ASC")
      .take(limit)
      .skip((page - 1) * limit)
      .getRawMany<{ id: string }>();

    const ids = idRows.map((r) => r.id);

    if (ids.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page,
          limit,
          pageCount: Math.ceil(total / limit),
        },
      };
    }

    const products = await this.repository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.images", "img")
      .where("p.id IN (:...ids)", { ids })
      .orderBy(sortColumn, order as "ASC" | "DESC")
      .addOrderBy("p.id", "ASC")
      .addOrderBy("img.position", "ASC")
      .getMany();


    const byId = new Map(products.map((p) => [p.id, p]));
    const data = ids.map((id) => byId.get(id)).filter(Boolean) as ProductEntity[];

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductEntity> {
    const entity = await this.repository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.images", "img")
      .where("p.id = :id", { id })
      .orderBy("img.position", "ASC")
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        `${this.constructor.name.replace("Service", "")} not found`,
      );
    }

    return entity;
  }

  async addImage(productId: string, file: Express.Multer.File): Promise<ProductImageEntity> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (!file) throw new BadRequestException('Missing file');
    if (!file.mimetype?.startsWith('image/')) throw new BadRequestException('Only images allowed');

    const last = await this.productsImagesRepository.find({
      where: { productId },
      order: { position: 'DESC' as any },
      take: 1,
    });

    const nextPosition = (last[0]?.position ?? -1) + 1;

    const { url, path } = await this.storage.uploadPublicImage(file, `products/${productId}`);

    const image = this.productsImagesRepository.create({
      productId,
      url,
      path,
      position: nextPosition,
    });

    return this.productsImagesRepository.save(image);
  }

  async listImages(productId: string): Promise<ProductImageEntity[]> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.productsImagesRepository.find({
      where: { productId },
      order: { position: 'ASC' as any },
    });
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<ProductImageEntity> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const images = await this.productsImagesRepository.find({
      where: { productId },
      order: { position: 'ASC' as any },
    });

    if (!images.length) throw new NotFoundException('No images for this product');

    const target = images.find((img) => img.id === imageId);
    if (!target) throw new NotFoundException('Image not found for this product');

    if (target.position === 0) return target;

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(this.productsImagesRepository.target as any);

      const reordered = [
        target,
        ...images.filter((img) => img.id !== imageId),
      ].map((img, index) => ({ ...img, position: index }));

      await repo.save(reordered);

      return reordered[0];
    });
  }

  async reorderImages(productId: string, orderIds: string[]): Promise<ProductImageEntity[]> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new BadRequestException('orderIds must be a non-empty array');
    }

    const unique = new Set(orderIds);
    if (unique.size !== orderIds.length) {
      throw new BadRequestException('orderIds contains duplicates');
    }

    const images = await this.productsImagesRepository.find({
      where: { productId },
      order: { position: 'ASC' as any },
    });

    if (!images.length) throw new NotFoundException('No images for this product');

    if (orderIds.length !== images.length) {
      throw new BadRequestException('orderIds must include all images of the product');
    }

    const imagesById = new Map(images.map((img) => [img.id, img]));

    for (const id of orderIds) {
      if (!imagesById.has(id)) {
        throw new BadRequestException(`Image ${id} does not belong to this product`);
      }
    }

    const reordered = orderIds.map((id, index) => {
      const img = imagesById.get(id)!;
      img.position = index;
      return img;
    });

    await this.productsImagesRepository.save(reordered);

    return reordered.sort((a, b) => a.position - b.position);
  }

  async removeImage(productId: string, imageId: string): Promise<ProductImageEntity> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const image = await this.productsImagesRepository.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found for this product');

    await this.storage.deleteImage(image.path);
    await this.productsImagesRepository.remove(image);

    await this.dataSource.transaction(async (manager) => {
      const imgRepo = manager.getRepository(this.productsImagesRepository.target as any);

      const images = await imgRepo.find({ where: { productId }, order: { position: 'ASC' as any } });
      const reordered = images.map((img, idx) => ({ ...img, position: idx }));
      await imgRepo.save(reordered);
    });

    return image;
  }

  async adjustStockOnSaleConfirmation(
    items: SaleItemEntity[],
    repository: Repository<ProductEntity>,
  ): Promise<string[]> {
    const warns: string[] = [];

    const grouped = new Map<string, { qty: number; nameSnapshot: string; saleId: string }>();
    for (const it of items) {
      const curr = grouped.get(it.productId);
      if (curr) curr.qty += it.quantity;
      else grouped.set(it.productId, { qty: it.quantity, nameSnapshot: it.nameSnapshot, saleId: it.saleId });
    }

    await Promise.all(
      Array.from(grouped.entries()).map(async ([productId, meta]) => {
        const product = await repository.findOne({ where: { id: productId } });

        if (!product) {
          warns.push(`Product ${productId} - ${meta.nameSnapshot} not found for sale ${meta.saleId}`);
          return;
        }

        if (product.stock === null || product.stock === undefined) return;

        const res = await repository
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ stock: () => `"stock" - ${meta.qty}` })
          .where('id = :id', { id: productId })
          .andWhere('"stock" IS NOT NULL')
          .andWhere('"stock" >= :qty', { qty: meta.qty })
          .execute();

        if (!res.affected) {
          warns.push(
            `Product ${productId} - ${product.name} insufficient stock. Available: ${product.stock}, required: ${meta.qty}`,
          );
        }
      }),
    );

    return warns;
  }

  async adjustStockOnSaleCancel(
    items: SaleItemEntity[],
    repository: Repository<ProductEntity>,
  ): Promise<void> {
    const grouped = new Map<string, number>();
    for (const it of items) {
      grouped.set(it.productId, (grouped.get(it.productId) ?? 0) + it.quantity);
    }

    await Promise.all(
      Array.from(grouped.entries()).map(async ([productId, qty]) => {
        await repository
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ stock: () => `"stock" + ${qty}` })
          .where('id = :id', { id: productId })
          .andWhere('"stock" IS NOT NULL')
          .execute();
      }),
    );
  }

}
