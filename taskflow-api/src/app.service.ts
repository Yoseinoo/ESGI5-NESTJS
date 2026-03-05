import { Injectable } from '@nestjs/common';

export interface ApiInfo {
  message: string;
  version: string;
}

@Injectable()
export class AppService {
  getHello(): ApiInfo {
    return {
      message: 'TaskFlow API',
      version: '1.0.0',
    };
  }
}
