import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  code: string;

  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @Matches(RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'), {
    message:
      'Password Must Contain 1 Uppercase, 1 Lowercase, 1 Special Char and 1 Number',
  })
  new_password: string;

  @IsString()
  @ApiProperty()
  re_new_password: string;
}
