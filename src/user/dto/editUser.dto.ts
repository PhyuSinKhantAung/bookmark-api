import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  firstname?: string;
  lastname?: string;
}
