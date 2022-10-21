import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter/app.excp.filter';
import { GoogleStrategy } from './google.strategy';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [
    GoogleStrategy,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
