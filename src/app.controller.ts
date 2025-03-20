import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from './role.guard';

@Controller()
export class AppController {
  @UseGuards(RoleGuard)
  @Get('protected-resource')
  getProtectedResource(): { message: string } {
    return { message: 'Access granted to admin' };
  }
}