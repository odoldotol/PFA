import { Module } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";

@Module({
    imports: [],
    providers: [
        ConnectService,
        RedisService,
    ],
    exports: [
        RedisService,
    ]
})
export class RedisModule {}