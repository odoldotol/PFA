import {
  Global,
  Module
} from "@nestjs/common";
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { serviceArr } from "./service";
import options from "./const/moduleOptions.const";

@Global()
@Module({
  imports: [NestConfigModule.forRoot(options)],
  providers: serviceArr,
  exports: serviceArr
})
export class ConfigModule {}
