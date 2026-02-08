import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  sku: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

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
