import {
  registerDecorator,
  ValidationOptions,
  ValidationDecoratorOptions,
  ValidationArguments
} from 'class-validator';

/**
 * ### 길이 제한
 * - 한글은 1글자당 길이 3으로 계산
 * - 영문, 숫자, 특수문자, 공백 등은 모두 길이 1로 계산
 */
export function IsSafeLengthQuery(
  validationOptions?: ValidationOptions
) {
  return function(
    object: Object,
    propertyName: string
  ) {
    const validationDecoratorOptions
    : ValidationDecoratorOptions
    = {
      name: 'isValidQuery',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Query is too long.',
        ...validationOptions
      },
      validator: {
        validate(
          value: string,
          _args: ValidationArguments
        ): boolean {
          const limit = 100;
          let length = 0;

          for (let i = 0; i < value.length; i++) {
            const char = value.charAt(i);
            if (/[가-힣]/.test(char)) {
              length += 3;
            } else {
              length += 1;
            }
          }

          if (length > limit) {
            return false;
          }

          return true;
        },
      },
    };

    registerDecorator(validationDecoratorOptions);
  };
}