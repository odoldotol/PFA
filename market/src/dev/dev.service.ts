import { Injectable } from '@nestjs/common';
import { DBRepository } from '@database.repository';

@Injectable()
export class DevService {

    constructor(
        private readonly dbRepo: DBRepository) {}

    getAllAssetsInfo = this.dbRepo.readAllAssetsInfo;
    getAllStatusPrice = this.dbRepo.readAllStatusPrice;
    getUpdateLog = this.dbRepo.readUpdateLog;
}
