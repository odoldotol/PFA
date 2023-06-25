import { CacheModule, Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { DBRepository } from "./database.repository";

@Module({
    imports: [
        MongoModule,
        CacheModule.register(),
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}