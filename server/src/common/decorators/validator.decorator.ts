import {
  registerDecorator,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';

export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== undefined, options);
}

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((obj, value) => value !== null, options);
}

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return /^[\d!#$%&*@A-Z^a-z]*$/.test(value);
        },
      },
    });
  };
}
