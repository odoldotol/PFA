import { PipeTransform } from "@nestjs/common";

export class UpperCasePipe implements PipeTransform {
    transform(value) {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                return value.map((str) => str.toUpperCase());
            } else if (value instanceof Object) {
                return Object.entries(value).reduce((acc, [key, value]) => {
                    if (typeof value === 'string') acc[key] = value.toUpperCase();
                    else acc[key] = value;
                    return acc;
                }, {});
            } else if (typeof value === 'string') {
                return value.toUpperCase();
            }
        }
    }
}