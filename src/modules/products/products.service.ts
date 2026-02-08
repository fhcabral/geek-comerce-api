import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/products.entity';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { BaseService } from 'src/common/base-service';

@Injectable()
export class ProductsService extends BaseService<ProductEntity, CreateProductDto, UpdateProductDto> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {
    super(repo);
  }
  
}
