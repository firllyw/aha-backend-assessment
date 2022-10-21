import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestPasswordChangeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}
