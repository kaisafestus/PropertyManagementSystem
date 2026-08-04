import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';
import { PasswordMatch } from '../validators/password-match.validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @PasswordMatch({ message: 'Passwords do not match' })
  confirmPassword!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsString()
  @Length(10, 20)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid phone number (10-20 characters)',
  })
  phone!: string;
}
