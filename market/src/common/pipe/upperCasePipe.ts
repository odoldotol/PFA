import { PipeTransform } from "@nestjs/common";
import * as F from '@fxts/core'

export class UpperCasePipe implements PipeTransform {

    transform = (value?: string | Array<any> | object): string | Array<any> | object => {
        if (Array.isArray(value)) {
            return value.map((ele) => this.strToUpperCasePipe(ele));
        } else if (value instanceof Object) {
            return F.pipe(
                value,
                Object.entries,
                F.map(([k,v]) => [k, this.transform(v)] as [string, any]),
                F.fromEntries
            );
        } else return this.strToUpperCasePipe(value);
    }

    strToUpperCasePipe = (v: any) => typeof v === 'string' ? v.toUpperCase() : v;
}