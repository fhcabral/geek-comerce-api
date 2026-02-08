import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  getHello() {
    return {
      message: 'Success',
      status: HttpStatus.OK
    };
  }
}
