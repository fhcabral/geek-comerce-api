import { NotFoundException } from '@nestjs/common';
import { DeepPartial, ObjectLiteral, Repository, FindManyOptions, ILike } from 'typeorm';
import { CrudService } from './types/crud-service.interface';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponse } from './types/paginated-response';
import { isUUID } from 'class-validator';

export abstract class BaseService<T extends ObjectLiteral, CreateDto, UpdateDto>
  implements CrudService<T, CreateDto, UpdateDto> {
  constructor(protected readonly repository: Repository<T>) { }

  async findAll(query?: PaginationQueryDto): Promise<T[] | PaginatedResponse<T>> {
    if (!query) return this.repository.find();

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const options: FindManyOptions<T> = {
      take: limit,
      skip: (page - 1) * limit,
    };

    if (query.sort) {
      options.order = { [query.sort]: (query.order ?? 'DESC') } as any;
    }

    if (query.search) {
      const string = String(query.search).trim();

      const where: any[] = [];

      where.push({ name: ILike(`%${string}%`) });
      
      if(isUUID(string)) {
        where.push({ id: string });
      }

      options.where = where;
  }

    const [data, total] = await this.repository.findAndCount(options);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.constructor.name.replace('Service', '')} not found`,
      );
    }

    return entity;
  }

  async create(dto: CreateDto): Promise<T> {
    const entity = this.repository.create(dto as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    const entity = await this.findOne(id);
    this.repository.merge(entity, dto as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
