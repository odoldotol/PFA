import { Module } from "@nestjs/common";
import { RedisConnectService } from "./redis_connect.service";

@Module({
    imports: [],
    providers: [RedisConnectService],
    exports: []
})
export class RedisModule {}