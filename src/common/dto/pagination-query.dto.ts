import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  from?: Date;

  @IsDateString()
  @IsOptional()
  to?: Date;

  @IsString()
  @IsOptional()
  sort?: string; // ex: "createdAt" ou "name"

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}
