import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerCpf?: string;
}
