// 원본 - market/src/common/pipe/upperCasePipe.ts

import { PipeTransform } from "@nestjs/common";
import * as F from '@fxts/core'

export class UpperCasePipe implements PipeTransform {

    transform = (value?: string | Array<any> | object): string | Array<any> | object => F.pipe(
        value,
        this.strToUpperCasePipe,
        this.arrToUpperCasePipe,
        this.objToUpperCasePipe);

    private strToUpperCasePipe = (val: any) =>
        typeof val === 'string' ? val.toUpperCase(): val;

    private arrToUpperCasePipe = (val: any) =>
        F.isArray(val) ? val.map(this.transform) : val;

    private objToUpperCasePipe = (val: any) => 
        typeof val === 'object' &&
        F.not(F.isArray(val)) &&
        F.not(F.isNil(val)) ? F.pipe(
            val,
            Object.entries,
            F.map(([k,v]) => [k, this.transform(v)] as [string, any]),
            F.fromEntries
        ) : val;
        
}