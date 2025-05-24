import { readFileSync } from "fs";
import { AppConfigService } from "src/config";
import * as F from "@fxts/core";

/**
 * 주의 - 프로토타입 체인상 직전 프로토타입을 기반으로 json 파일의 유효성을 검사함.  
 * => 자식 클래스에서 매서드를 정의만 하는 것으로 text 디자인이 끝나고 여기에서 디자인을 바탕으로 json 파일 검사 및 메서드를 구현함.
 */
export abstract class TextService<T extends Record<string, any>> {

  private readonly exception = [
    "constructor",
    "data" //
  ];

  protected readonly data: Data<T>;

  /**
   * production 환경이 아니면 jsonPath 를 읽지 않고 sample 을 만듦.
   */
  constructor(
    jsonPath: string,
    appConfigSrv: AppConfigService,
  ) {
    if (appConfigSrv.isProduction()) {
      this.data = this.loadText(jsonPath);
    } else {
      this.data = this.sampleText();
    }

    if (this.validate() == false) {
      throw new Error(`${this.constructor.name}: Failed to load all text`);
    }

    this.implMethods();
  }

  private validate(): boolean {
    return F.pipe(
      this.designedKeyIter(),
      F.every(key => typeof this.data[key] == "string")
    );
  }

  private loadText(jsonPath: string): any {
    return JSON.parse(readFileSync(jsonPath, "utf-8"));
  }

  private sampleText(): Data<T> {
    return F.pipe(
      this.designedKeyIter(),
      F.map(key => [key, key] as [keyof T, string]),
      F.fromEntries,
    ) as Data<T>;
  }

  private implMethods() {
    F.pipe(
      this.designedKeyIter(),
      F.each(key => {
        Object.getPrototypeOf(this)[key] = function () {
          return this.data[key];
        };

        Object.defineProperty(Object.getPrototypeOf(this)[key], "name", {
          value: key,
        });
      })
    );
  }

  private designedKeyIter(): IterableIterator<keyof T & string> {
    return F.pipe(
      Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
      F.difference(this.exception),
    );
  }

}

type Data<T> = {
  [key in keyof T]: string
};