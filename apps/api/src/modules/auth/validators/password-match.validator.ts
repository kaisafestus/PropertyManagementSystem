import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: any, _args: ValidationArguments): boolean {
    const { password } = _args.object as Record<string, any>;
    return password === confirmPassword;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Passwords do not match';
  }
}

export function PasswordMatch(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [new PasswordMatchConstraint()],
      validator: PasswordMatchConstraint,
    });
  };
}
