import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://rollyy:1234p!!!@localhost:5434/mynestdb?schema=public',
        },
      },
    });
  }
}
