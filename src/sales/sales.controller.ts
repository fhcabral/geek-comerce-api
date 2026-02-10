import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ApiResponse } from 'src/common/types/api-response';
import { SalesEntity } from './entities/sale.entity';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { responseJson } from 'src/common/default-response';
import { OwnerOnly } from 'src/modules/authentication/roles/owner-only.decorator';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { AddSaleItemDto } from './dto/add-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
import { SaleItemEntity } from './entities/sale-item.entity';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @OwnerOnly()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<SalesEntity[] | PaginatedResponse<SalesEntity>>> {
    const sales = await this.salesService.findAll(query);
    return responseJson(sales, 'Vendas listadas com sucesso');
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<SalesEntity>> {
    const sale = await this.salesService.findOne(id);
    return responseJson(sale, 'Venda listada com sucesso');
  }

  @Post()
  async create(@Body() dto: CreateSaleDto): Promise<ApiResponse<SalesEntity>> {
    const sale = await this.salesService.create(dto);
    return responseJson(sale, 'Venda criada com sucesso');
  }

  @Put(':id')
  async update(   
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSaleDto,
  ): Promise<ApiResponse<SalesEntity>> {
    const sale = await this.salesService.update(id, dto);
    return responseJson(sale, 'Venda atualizada com sucesso');
  }

  @Delete(':id')
  @OwnerOnly()
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<void>> {
    const sale = await this.salesService.remove(id);
    return responseJson(sale, 'Venda deletada com sucesso');
  }

  @Post(':id/items')
  async addItem(@Param('id') id: string, @Body() dto: AddSaleItemDto): Promise<ApiResponse<SaleItemEntity>> {
    return responseJson(await this.salesService.addItem(id, dto));
  }

  @Put(':id/items/:itemId')
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSaleItemDto,
  ): Promise<ApiResponse<SaleItemEntity>> {
    return responseJson(await this.salesService.updateItemQuantity(id, itemId, dto), 'Item atualizado com sucesso');
  }

  @Delete(':id/items/:itemId')  
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateSaleItemDto): Promise<ApiResponse<SaleItemEntity>> {
    return responseJson(await this.salesService.removeItem(id, itemId, dto), 'Item removido com sucesso');
  }

  @Put(':id/confirm')
  async confirm(@Param('id') id: string): Promise<ApiResponse<any>> {
    return responseJson(await this.salesService.confirm(id));
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string): Promise<ApiResponse<any>> {
    return responseJson(await this.salesService.cancel(id));
  }
}
