import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseService } from 'src/common/base-service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService extends BaseService<UsersEntity, CreateUserDto, UpdateUserDto> {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly repo: Repository<UsersEntity>,
  ) {
    super(repo);
  }

  async create(dto: CreateUserDto): Promise<UsersEntity> {
    const entity = this.repository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 12),
    });

    return this.repository.save(entity);
  }


  async update(id: string, dto: UpdateUserDto): Promise<UsersEntity> {
    const entity = await this.findOne(id);

    if(dto['password']) {
      dto['password'] = await bcrypt.hash(dto['password'], 12)
    }

    this.repository.merge(entity, dto as DeepPartial<UsersEntity>);
    return this.repository.save(entity);
  }

  async findByEmailWithPassword(email: string) {
    return this.repository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }
  
}
