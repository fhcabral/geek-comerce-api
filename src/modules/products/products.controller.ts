import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/products.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { responseJson } from 'src/common/default-response';
import { ApiResponse } from 'src/common/types/api-response';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

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

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<ProductImageEntity>> {
    const image = await this.productsService.addImage(id, file);
    return responseJson(image, 'Imagem adicionada com sucesso');
  }

  @Get(':id/images')
  async listImages(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<ProductImageEntity[]>> {
    const images = await this.productsService.listImages(id);
    return responseJson(images, 'Imagens listadas com sucesso');
  }

  @Patch(':id/images/:imageId/primary')
  async setPrimaryImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
  ): Promise<ApiResponse<ProductImageEntity>> {
    const image = await this.productsService.setPrimaryImage(id, imageId);
    return responseJson(image, 'Imagem definida como principal com sucesso');
  }

  @Put(':id/images/reorder')
  async reorderImages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { orderIds: string[] },
  ): Promise<ApiResponse<ProductImageEntity[]>> {
    const images = await this.productsService.reorderImages(id, body.orderIds);
    return responseJson(images, 'Imagens reordenadas com sucesso');
  }


  @Delete(':id/images/:imageId')
  async removeImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
  ): Promise<ApiResponse<ProductImageEntity>> {
    const image = await this.productsService.removeImage(id, imageId);
    return responseJson(image, 'Imagem deletada com sucesso');
  }
}
