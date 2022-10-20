import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    // Soft Delete
    this.$use(async (params, next) => {
      if (params.action == 'delete') {
        params.action = 'update';
        params.args['data'] = {
          deleted_at: new Date(),
        };
      }
      if (params.action == 'deleteMany') {
        params.action = 'updateMany';
        params.args['data'] = {
          deleted_at: new Date(),
        };
      }
      return next(params);
    });
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
