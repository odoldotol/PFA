import { PipeTransform } from "@nestjs/common";
import * as F from '@fxts/core'

export class UpperCasePipe implements PipeTransform {

    transform = (value?: string | Array<any> | object): string | Array<any> | object => F.pipe(
        value,
        this.strToUpperCasePipe,
        this.arrToUpperCasePipe,
        this.objToUpperCasePipe);

    private strToUpperCasePipe = (v: any) => typeof v === 'string' ? v.toUpperCase() : v;

    private arrToUpperCasePipe = (v: any) => F.isArray(v) ? v.map(this.strToUpperCasePipe) : v;

    private objToUpperCasePipe = (v: any) => F.not(F.isNil(v)) && typeof v === 'object' && F.not(F.isArray(v)) ?
        F.pipe(
            v,
            Object.entries,
            F.map(([k,v]) => [k, this.transform(v)] as [string, any]),
            F.fromEntries)
        : v;
}