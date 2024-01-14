// Todo: remove

import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { InMemoryModule } from "./inMemory/inMemory.module";

@Module({
  imports: [
    InMemoryModule
  ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DBModule {}
