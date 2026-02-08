import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductEntity } from './products.entity';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { responseJson } from 'src/common/default-response';
import { ApiResponse } from 'src/common/types/api-response';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto): Promise<ApiResponse<ProductEntity[] | PaginatedResponse<ProductEntity>>> {
    const products = await this.productsService.findAll(query);
    return responseJson(products, 'Produtos listados com sucesso');
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<ProductEntity>> {
    const user = await this.productsService.findOne(id);
    return responseJson(user, 'Produto listado com sucesso');
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ApiResponse<ProductEntity>> {
    const user = await this.productsService.create(dto);
    return responseJson(user, 'Produto criado com sucesso');
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<ProductEntity>> {
    const user = await this.productsService.update(id, dto);
    return responseJson(user, 'Produto atualizado com sucesso');
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<void>> {
    const user = await this.productsService.remove(id);
    return responseJson(user, 'Produto deletado com sucesso');
  }
}
