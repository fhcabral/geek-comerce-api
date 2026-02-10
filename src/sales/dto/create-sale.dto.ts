import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
