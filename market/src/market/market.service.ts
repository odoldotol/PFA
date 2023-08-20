import { Injectable, Logger } from '@nestjs/common';
import { ChildApiService } from './child_api/child_api.service';

@Injectable()
export class MarketService {

  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly childApiService: ChildApiService
  ) {}

  public fetchInfo(ticker: string) {
    return this.childApiService.fetchYfInfo(ticker).then(
      res => res.map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as YfInfo)
    );
  }

  public fetchPrice(ticker: string) {
    return this.childApiService.fetchYfPrice(ticker).then(
      res => res.map(v => Object.assign(v, {symbol: ticker}) as YfPrice)
    )
  };

}
