import { Module } from "@nestjs/common";
import { MongoModule } from "./mongodb/mongodb.module";
import { DBRepository } from "./database.repository";
import { PostgresModule } from "./postgres/postgres.module";

@Module({
    imports: [
        MongoModule,
        PostgresModule
    ],
    providers: [DBRepository],
    exports: [DBRepository]
})
export class DBModule {}