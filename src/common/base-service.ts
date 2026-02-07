import { NotFoundException } from '@nestjs/common';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';
import { CrudService } from './interfaces/crud-service.interface';

export abstract class BaseService<T extends ObjectLiteral, CreateDto, UpdateDto>
  implements CrudService<T, CreateDto, UpdateDto>
{
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(query?: any): Promise<T[]> {
    return this.repository.find(query);
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
