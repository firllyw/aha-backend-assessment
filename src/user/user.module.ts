import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as sib from '@sendinblue/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'SendinBlue',
        auth: {
          user: 'fwahyudi17@gmail.com',
          pass: 'hn7WrcUVYQTxa3fj',
        },
      },
    }),
    sib.TransactionalEmailsApi,
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
