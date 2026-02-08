import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(70)
  sku?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  cost?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
