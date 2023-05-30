import { CacheModule, Module } from "@nestjs/common";
import { Pm2Module } from "src/pm2/pm2.module";
import { AppMemoryService } from "./appMemory.service";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
        Pm2Module
    ],
    providers: [AppMemoryService],
    exports: [AppMemoryService]
})
export class AppMemoryModule {}
