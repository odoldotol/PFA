import { readFileSync } from "fs";
import * as F from "@fxts/core";

/**
 * 주의 - 프로토타입 체인상 직전 프로토타입을 기반으로 json 파일의 유효성을 검사함.
 */
export abstract class TextService<T extends Record<string, any>> {

  private readonly exception = [
    "constructor",
    "data" //
  ];

  protected readonly data: {
    [key in keyof T]: string
  }

  constructor(jsonPath: string) {
    this.data = this.loadText(jsonPath);

    if (this.validate() == false) {
      throw new Error(`${this.constructor.name}: Failed to load all text`);
    }
  }

  private validate() :boolean {
    return F.pipe(
      Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
      F.difference(this.exception),
      F.every(key => typeof this.data[key] == "string")
    );
  }

  private loadText(jsonPath: string): any {
    return JSON.parse(readFileSync(jsonPath, "utf-8"));
  }

}
