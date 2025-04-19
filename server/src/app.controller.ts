import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      message: 'Server OK',
      timestamp: new Date().toISOString(),
    };
  }
}
