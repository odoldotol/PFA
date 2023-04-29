import { PipeTransform } from "@nestjs/common";

export class UpperCasePipe implements PipeTransform {

    transform = (value?: string | Array<any> | object) => {
        if (Array.isArray(value)) {
            return value.map((ele) => this.strToUpperCasePipe(ele));
        } else if (value instanceof Object) {
            return Object.entries(value).reduce((acc, [key, value]) => {
                // @ts-ignore
                if (typeof value === 'string') acc[key] = value.toUpperCase();
                // @ts-ignore
                else if (Array.isArray(value)) acc[key] = value.map((ele) => typeof ele === 'string' ? ele.toUpperCase() : ele);
                // @ts-ignore
                else acc[key] = value;
                return acc;
            }, {});
        } else return this.strToUpperCasePipe(value);
    }

    strToUpperCasePipe = (v: any) => typeof v === 'string' ? v.toUpperCase() : v;
}