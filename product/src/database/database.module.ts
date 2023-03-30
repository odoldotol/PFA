import { Module } from "@nestjs/common";
import { DBRepository } from "./database.repository";
import { IMCache } from "./iMCache/iMCache.module";

@Module({
    imports: [
        IMCache
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}