import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule as NestHttpModule, HttpModuleAsyncOptions } from '@nestjs/axios';
import { HealthService } from './health.service';
import { HttpService } from './http.service';

@Module({})
export class HttpModule extends NestHttpModule {
  static registerAsync(options: HttpModuleAsyncOptions): DynamicModule {
    const module = super.registerAsync(options);
    module.providers!.push(HttpService);
    module.providers!.push(HealthService);
    module.exports = [
      HttpService,
      HealthService
    ];
    return module;
  }
}
