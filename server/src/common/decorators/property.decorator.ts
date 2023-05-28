import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToUpperCase,
  Trim,
} from './transform.decorator';
import { IsPassword } from './validator.decorator';

interface IPropertyOptions {
  each?: boolean;
  swagger?: boolean;
  required?: boolean;
  validateIf?: (object: any, value: any) => boolean;
  groups?: string[];
}

interface INumberPropertyOptions extends IPropertyOptions {
  min?: number;
  max?: number;
  int?: boolean;
  positive?: boolean;
}

interface IStringPropertyOptions extends IPropertyOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  email?: boolean;
  password?: boolean;
  trim?: boolean;
}

interface IEnumPropertyOptions extends IPropertyOptions {
  number?: boolean;
}

export function NumberProperty(
  propertyName: string,
  options: Omit<ApiPropertyOptions, 'type'> & INumberPropertyOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf, { each: options.each }));
  }

  if (options.required) {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${propertyName} không được để trống!`,
      }),
    );
    if (options.swagger !== false) {
      decorators.push(ApiProperty({ type: Number, ...options }));
    }
  } else {
    decorators.push(IsOptional({ each: options.each }));
    if (options.swagger !== false) {
      decorators.push(ApiPropertyOptional({ type: Number, ...options }));
    }
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  if (options.int) {
    decorators.push(
      IsInt({
        each: options.each,
        message: `${propertyName} phải là số nguyên!`,
      }),
    );
  } else {
    decorators.push(
      IsNumber(
        {},
        {
          each: options.each,
          message: `${propertyName} phải là số!`,
        },
      ),
    );
  }

  if (typeof options.min === 'number') {
    decorators.push(
      Min(options.min, {
        each: options.each,
        message: `${propertyName} phải lớn hơn ${options.min}!`,
      }),
    );
  }

  if (typeof options.max === 'number') {
    decorators.push(
      Max(options.max, {
        each: options.each,
        message: `${propertyName} phải nhỏ hơn ${options.max}`,
      }),
    );
  }

  if (options.positive) {
    decorators.push(
      IsPositive({
        each: options.each,
        message: `${propertyName} phải là số dương!`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function StringProperty(
  propertyName: string,
  options: Omit<ApiPropertyOptions, 'type'> & IStringPropertyOptions = {},
): PropertyDecorator {
  const decorators = [];

  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf, { each: options.each }));
  }

  if (options.required) {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${propertyName} không được để trống!`,
      }),
    );
    if (options.swagger !== false) {
      decorators.push(ApiProperty({ type: String, ...options }));
    }
  } else {
    decorators.push(IsOptional({ each: options.each }));
    if (options.swagger !== false) {
      decorators.push(ApiPropertyOptional({ type: String, ...options }));
    }
  }

  decorators.push(Type(() => String));
  decorators.push(
    IsString({ each: options.each, message: `${propertyName} phải là chuỗi!` }),
  );

  if (options.minLength) {
    decorators.push(
      MinLength(options.minLength, {
        each: options.each,
        message: `${propertyName} phải nhiều hơn ${options.maxLength} ký tự!`,
      }),
    );
  }

  if (options.maxLength) {
    decorators.push(
      MaxLength(options.maxLength, {
        each: options.each,
        message: `${propertyName} phải ít hơn ${options.maxLength} ký tự!`,
      }),
    );
  }

  if (options.email) {
    options.toLowerCase = true;
    decorators.push(IsEmail({}, { message: `${propertyName} không hợp lệ!` }));
  }

  if (options.password) {
    decorators.push(IsPassword({ message: `${propertyName} không hợp lệ!` }));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  if (options.trim !== false) {
    decorators.push(Trim());
  }

  return applyDecorators(...decorators);
}

export function BooleanProperty(
  propertyName: string,
  options: Omit<ApiPropertyOptions, 'type'> & IPropertyOptions = {},
): PropertyDecorator {
  const decorators = [];

  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf, { each: options.each }));
  }

  if (options.required) {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${propertyName} không được để trống!`,
      }),
    );
    if (options.swagger !== false) {
      decorators.push(ApiProperty({ type: Boolean, ...options }));
    }
  } else {
    decorators.push(IsOptional({ each: options.each }));
    if (options.swagger !== false) {
      decorators.push(ApiPropertyOptional({ type: Boolean, ...options }));
    }
  }

  decorators.push(ToBoolean());
  decorators.push(IsBoolean({ message: `${propertyName} phải là boolean!` }));

  return applyDecorators(...decorators);
}

export function EnumProperty(
  propertyName: string,
  entity: object,
  options: Omit<ApiPropertyOptions, 'type'> & IEnumPropertyOptions = {},
): PropertyDecorator {
  const decorators = [];

  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf, { each: options.each }));
  }

  if (options.required) {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${propertyName} không được để trống!`,
      }),
    );
    if (options.swagger !== false) {
      decorators.push(ApiProperty({ ...options }));
    }
  } else {
    decorators.push(IsOptional({ each: options.each }));
    if (options.swagger !== false) {
      decorators.push(ApiPropertyOptional({ ...options }));
    }
  }

  if (options.number) {
    decorators.push(Type(() => Number));
  }

  decorators.push(
    IsEnum(entity, {
      message: `${propertyName} không hợp lệ!`,
    }),
  );

  return applyDecorators(...decorators);
}

export function DateProperty(
  propertyName: string,
  options: Omit<ApiPropertyOptions, 'type'> & IPropertyOptions = {},
): PropertyDecorator {
  const decorators = [];

  if (options.validateIf) {
    decorators.push(ValidateIf(options.validateIf, { each: options.each }));
  }

  if (options.required) {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${propertyName} không được để trống!`,
      }),
    );
    if (options.swagger !== false) {
      decorators.push(ApiProperty({ ...options }));
    }
  } else {
    decorators.push(IsOptional({ each: options.each }));
    if (options.swagger !== false) {
      decorators.push(ApiPropertyOptional({ ...options }));
    }
  }

  decorators.push(Type(() => Date));

  decorators.push(
    IsDate({
      message: `${propertyName} không hợp lệ!`,
    }),
  );

  return applyDecorators(...decorators);
}
