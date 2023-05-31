import { Injectable } from "@nestjs/common";
import { AppMemoryService } from "./appMemory/appMemory.service";

@Injectable()
export class InMemoryService {

    constructor(
        private readonly storeSrv: AppMemoryService,
    ) {}

    // [DEV]
    getAllKeys = this.storeSrv.getAllKeys;

}