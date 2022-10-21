import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as sib from '@sendinblue/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { FacebookSigninDto } from './dto/facebook-signup.dto';
import { GoogleSigninDto } from './dto/google-signup.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
  ) {}

  async googleSignin(data: GoogleSigninDto) {
    const user = await this.prisma.user.create({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        login_count: 1,
        email_verified: true,
      },
    });
    const token = await this.jwtService.sign(user.id);
    return {
      token,
    };
  }

  async facebookSignin(data: FacebookSigninDto) {}

  async register(data: RegisterDto) {
    if ((await this.confirmPassword(data)) == false) {
      throw new BadRequestException('Password Does not Match');
    }
    const salt = 10;
    const password = data.password;
    const hashed = await bcrypt.hash(password, salt);
    const otp = await (await this.generateOtp()).toString();
    const user = await this.prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashed,
        login_count: 1,
        email_verification_code: otp,
      },
    });
    await this.sendVerifyEmail(user);
    return {
      message:
        'We sent a confirmation to your email, please verify it to start using our platform',
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email: data.email,
      },
    });
    if (user.email_verified == false) {
      throw new UnauthorizedException('You need to verify your email');
    }
    if (await bcrypt.compare(data.password, user.password)) {
      const token = await this.jwtService.sign(user.id);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: { login_count: user.login_count + 1 },
      });
      return {
        token,
      };
    }
    throw new UnauthorizedException('Wrong Password');
  }

  async confirmPassword(data: RegisterDto): Promise<Boolean> {
    return data.password == data.re_password;
  }

  async sendVerifyEmail(user: User) {
    const mail = new sib.TransactionalEmailsApi();
    mail.setApiKey(
      sib.TransactionalEmailsApiApiKeys.apiKey,
      process.env.SMTP_API_KEY,
    );
    let mailing = new sib.SendSmtpEmail();
    mailing = {
      sender: {
        name: 'no-reply',
        email: 'fwahyudi17@gmail.com',
      },
      to: [
        {
          name: user.first_name,
          email: user.email,
        },
      ],
      subject: `Hi ${user.first_name}!, Verify Your Email`,
      templateId: 1,
      params: {
        button_text: 'Verify My Email',
        button_link: `http://localhost:3001/users/verify-email?email=${user.email}&code=${user.email_verification_code}`,
        first_name: user.first_name,
        body: 'Click the link below to verify your email',
      },
    };
    try {
      await mail.sendTransacEmail(mailing);
    } catch (e) {
      console.error(e);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async verifyEmail(query: VerifyEmailDto) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        email: query.email,
        email_verification_code: query.code,
      },
    });
    user.email_verification_code = null;
    user.email_verified = true;
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...user,
      },
    });
    return {
      status: 'Your email is verified',
    };
  }

  async generateOtp() {
    const digits = Math.floor(Math.random() * 90000) + 10000;
    const exist = await this.prisma.user.count({
      where: {
        email_verification_code: digits.toString(),
      },
    });
    if (exist > 0) {
      this.generateOtp();
    }
    return digits;
  }
}
