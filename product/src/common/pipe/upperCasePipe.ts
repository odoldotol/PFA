import { PipeTransform } from "@nestjs/common";
import * as F from '@fxts/core'

export class UpperCasePipe implements PipeTransform {

  transform(
    value?: string | Array<any> | object
  ): string | Array<any> | object {
    return F.pipe(
      value,
      this.strToUpperCasePipe,
      this.arrToUpperCasePipe.bind(this),
      this.objToUpperCasePipe.bind(this)
    );
  }

  private strToUpperCasePipe(val: any) {
    return typeof val === 'string' ? val.toUpperCase() : val;
  }

  private arrToUpperCasePipe(val: any) {
    return F.isArray(val) ? val.map(this.transform.bind(this)) : val;
  }

  private objToUpperCasePipe(val: any) {
    return typeof val === 'object'
    && F.not(F.isArray(val))
    && F.not(F.isNil(val))
    ? F.pipe(
      val,
      Object.entries,
      F.map(([k, v]) => [k, this.transform(v)] as [string, any]),
      F.fromEntries
    ) : val;
  }

}
