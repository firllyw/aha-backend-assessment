import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordChangeDto } from './dto/request-password-change.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('signup/google')
  @ApiOperation({ summary: 'sign in page using google' })
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any) {
    return this.service.googleSignin(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Email registration' })
  register(@Body() data: RegisterDto) {
    return this.service.register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'login using email' })
  login(@Body() data: LoginDto) {
    return this.service.login(data);
  }

  @Get()
  @ApiOperation({ summary: 'get all users' })
  findAll() {
    return this.service.findAll();
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'verify email using code otp' })
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.service.verifyEmail(query);
  }

  @Post('request-change-password')
  @ApiOperation({ summary: 'request for a password change' })
  requestChangePassword(@Body() data: RequestPasswordChangeDto) {
    return this.service.sendForgotPasswordEmail(data);
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'change password using code given on request change',
  })
  changePassword(@Body() data: ChangePasswordDto) {
    return this.service.changePassword(data);
  }
}
