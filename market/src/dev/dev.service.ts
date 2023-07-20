import { Injectable } from '@nestjs/common';
import { DBRepository } from 'src/database/database.repository';

@Injectable()
export class DevService {

    constructor(
        private readonly dbRepo: DBRepository) {}

    public getAllAssetsInfo() {
        return this.dbRepo.readAllAssetsInfo()
    };

    public getAllStatusPrice() {
        return this.dbRepo.readAllExchange()
    };

    public getUpdateLog(ISO_Code?: string, limit?: number) {
        return this.dbRepo.readUpdateLog(ISO_Code, limit);
    };
}
