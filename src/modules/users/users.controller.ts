import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersEntity } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { responseJson } from 'src/common/default-response';
import { ApiResponse } from 'src/common/interfaces/api-response';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: any): Promise<ApiResponse<UsersEntity[]>> {
    const users = await this.usersService.findAll(query);
    return responseJson(users, 'Usuários listados com sucesso');
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<UsersEntity>> {
    const user = await this.usersService.findOne(id);
    return responseJson(user, 'Usuário listado com sucesso');
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<ApiResponse<UsersEntity>> {
    const user = await this.usersService.create(dto);
    return responseJson(user, 'Usuário criado com sucesso');
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse<UsersEntity>> {
    const user = await this.usersService.update(id, dto);
    return responseJson(user, 'Usuário atualizado com sucesso');
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<void>> {
    const user = await this.usersService.remove(id);
    return responseJson(user, 'Usuário deletado com sucesso');
  }
}
