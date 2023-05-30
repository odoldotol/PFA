import { Injectable } from "@nestjs/common";
import { AppMemoryService } from "./appMemory/appMemory.service";

@Injectable()
export class InMemoryService {

    constructor(
        private readonly appMemorySrv: AppMemoryService,
    ) {}

    // [DEV]
    getAllKeys = this.appMemorySrv.getAllKeys;

}