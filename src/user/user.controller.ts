import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('signup/google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any) {
    return this.service.googleSignin(req.user);
  }

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.service.register(data);
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.service.login(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('verify-email')
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.service.verifyEmail(query);
  }

  @Post('request-change-password')
  requestChangePassword(@Body() data: { email: string }) {
    return this.service.sendForgotPasswordEmail(data.email);
  }

  @Post('change-password')
  changePassword(@Body() data: ChangePasswordDto) {
    return this.service.changePassword(data);
  }
}
