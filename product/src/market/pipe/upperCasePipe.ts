import { PipeTransform } from "@nestjs/common";

export class UpperCasePipe implements PipeTransform {
    transform(value: string | string[]) {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                return value.map((str) => str.toUpperCase());
            }
            return value.toUpperCase();
        }
    }
}