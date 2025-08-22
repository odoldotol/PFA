export * from './logger.module';

import { ConsoleLogger } from './console';

const DefaultLogger = ConsoleLogger;

export {
  DefaultLogger,
  // ConsoleLogger,
};

/**
 * 주입된 로거를 사용하는것이 메모리상 이득이 있겠지만 컨텍스트 분리, 사용편의상 상속을 사용했다.  
 * 인스턴스 하나당 1~3KB 정도 메모리 손해보는것 같다. 유의미해질 정도가 되면 리팩토링 생각해보자.
 */
export class Loggable {
  protected readonly logger = new DefaultLogger(this.constructor.name);
}
