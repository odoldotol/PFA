import { CacheModule, Module } from "@nestjs/common";
import { AppMemoryService } from "./appMemory.service";

@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 60 * 24 * 5, // 5 days
        }),
    ],
    providers: [AppMemoryService],
    exports: [AppMemoryService]
})
export class AppMemoryModule {}
