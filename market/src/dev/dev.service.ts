import { Injectable } from '@nestjs/common';
import { DBRepository } from '@database.repository';
import { ChildApiService } from '@child-api.service';

@Injectable()
export class DevService {

    constructor(
        private readonly dbRepo: DBRepository,
        private readonly childApiServ: ChildApiService) {}

    getChildApiDocs = this.childApiServ.apiDocs;
    getChildApiOpenapiJson = this.childApiServ.openapiJson;
    getAllAssetsInfo = this.dbRepo.readAllAssetsInfo;
    getAllStatusPrice = this.dbRepo.readAllStatusPrice;
    getUpdateLog = this.dbRepo.readUpdateLog;
}
