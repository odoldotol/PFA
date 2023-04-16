import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class ChildApiService {

    constructor(
        private httpService: HttpService,) {}

    apiDocs = async () => { // 이렇게는 안열리네? 그냥 서버 노출하고 cors 로 Get 빼고 다 막자
        return firstValueFrom(
            this.httpService
            .get('/docs')
            .pipe(
                map((response: AxiosResponse) => response.data),
                map((data: string) => data.replace(/openapi.json/, 'api/v1/dev/child/openapi.json')),
                catchError((error: AxiosError) => {throw error;})
            )
        );
    }

    openapiJson = async () => {
        return firstValueFrom(
            this.httpService
            .get('/openapi.json')
            .pipe(
                map((response: AxiosResponse) => response.data),
                catchError((error: AxiosError) => {throw error;})
            )
        );
    }


}
