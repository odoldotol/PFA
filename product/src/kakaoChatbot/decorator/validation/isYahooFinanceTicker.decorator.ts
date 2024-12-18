import {
  registerDecorator,
  ValidationOptions,
  ValidationDecoratorOptions,
  ValidationArguments
} from 'class-validator';
import { chatbotListMenuButtons } from '../../const';

/**
 * - is string
 * - is not empty string
 * - is not including korean
 * 
 * 야후파이낸스티커는 아마도 (기호) + 영어n숫자 + (.국가코드) 로 이루어짐.
 * 하지만 지금은 간단하게 한글이 포함되는것(챗봇의 UserFlow 상 자주 발생하는 유형)만 걸러냄.
 * 티커로 검색하는것은 더 편한방식(이름으로 검색하는 등)으로 대체(티커로 검색은 가능하나 숨겨진 기능이 되어야함)되어야함.
 */
export function IsYahooFinanceTicker(
  validationOptions?: ValidationOptions
) {
  return function(
    object: Object,
    propertyName: string
  ) {
    const validationDecoratorOptions
    : ValidationDecoratorOptions
    = {
      name: 'isYahooFinanceTicker',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'ticker must be a YahooFinanceTicker',
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

          return typeof value === 'string' &&
          0 < value.length &&
          !/[\u3131-\uD79D]/.test(value);
        },
      },
    };

    registerDecorator(validationDecoratorOptions);
  };
}