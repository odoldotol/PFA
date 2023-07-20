import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { filter, firstValueFrom, noop} from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ConnectionService implements OnModuleInit {

  private readonly logger = new Logger("MarketApi-" + ConnectionService.name);

  constructor(
    private httpService: HttpService
  ) {}

  async onModuleInit() {
    let isAvailable = false;
    
    return new Promise<void>((resolve) => {
      let timerCallback: (() => void) | null = () => {
        isAvailable || 
        this.healthCheck()
        .then(() => {
          isAvailable || (this.logger.log("Server is Available"), isAvailable = true);
          clearInterval(timer);
          timerCallback = null;
          resolve();
        })
        .catch(noop);
      };

      this.logger.log("Waiting for Connection...");
      const timer = setInterval(timerCallback, 1000);
    });
  }

  private healthCheck() {
    return firstValueFrom(this.httpService.get("health").pipe(
      filter((res: AxiosResponse) => res.status === 200)
    ));
  }

}
