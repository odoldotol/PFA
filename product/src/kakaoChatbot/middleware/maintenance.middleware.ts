import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppConfigService } from 'src/config';
import { SkillResponseService } from '../skillResponse.service';

@Injectable()
export class MaintenanceMiddleware
  implements NestMiddleware
{
  constructor(
    private readonly appConfigSrv: AppConfigService,
    private readonly skillResponeSrv: SkillResponseService,
  ) {}

  use(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (
      this.isUnderMaintenance() &&
      this.isMaintenanceRequest(req) === false
    ) {
      res.status(200).json(this.skillResponeSrv.underMaintenance());
    } else {
      next();
    }
  }

  private isUnderMaintenance(): boolean {
    return this.appConfigSrv.isMaintenance();
  }

  private isMaintenanceRequest(req: Request): boolean {
    return req.headers['x-maintenance'] !== undefined;
  }

}
