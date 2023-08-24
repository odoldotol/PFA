import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from '../child_api/child_api.service';
import { TYfInfo, TYfPrice } from './type';

@Injectable()
export class AssetService {

  private readonly logger = new Logger('Market_' + AssetService.name);

  constructor(
    private readonly childApiService: ChildApiService
  ) {}

  public async fetchInfo(ticker: string) {
    return (await this.childApiService.fetchYfInfo(ticker))
    .map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as TYfInfo);
  }

  public async fetchPrice(ticker: string) {
    return (await this.childApiService.fetchYfPrice(ticker))
    .map(v => Object.assign(v, { symbol: ticker }) as TYfPrice);
  };

}
