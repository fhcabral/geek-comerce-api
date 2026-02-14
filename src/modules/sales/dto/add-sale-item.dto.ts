import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddSaleItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
