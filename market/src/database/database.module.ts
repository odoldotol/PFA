import { Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { DBRepository } from "./database.repository";

@Module({
    imports: [MongoModule],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}