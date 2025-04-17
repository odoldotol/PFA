import {
  registerDecorator,
  ValidationOptions,
  ValidationDecoratorOptions,
  ValidationArguments
} from 'class-validator';
import { chatbotListMenuButtons } from '../../const';

/**
 * ### false 리턴하는 경우
 * - string 아님
 * - 길이가 0
 * - 영문, 숫자, 한글 어느것도 없음
 * - 한글 모음이나 자음이 있음
 */
export function IsValidQuery(
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
        message: 'Invalid query.',
        ...validationOptions
      },
      validator: {
        validate(
          value: any,
          _args: ValidationArguments
        ): boolean {

          // 티커를 입력하지않고 메뉴 버튼을 클릭하는 경우가 많아서 이를 처리하기 위해 허락하는 부분.
          if (
            Object.values(chatbotListMenuButtons)
            .map(button => button.title)
            .includes(value)
          ) {
            return true;
          }

          if (
            typeof value !== 'string' ||
            value.length == 0 ||
            !/[a-zA-Z0-9가-힣]/.test(value) ||
            /[ㄱ-ㅎㅏ-ㅣ]/.test(value)
          ) {
            return false;
          }
            
          return true;
        },
      },
    };

    registerDecorator(validationDecoratorOptions);
  };
}