import { Module } from '@nestjs/common';
import { PortfolioManagerController } from './portfolio-manager.controller';
import { PortfolioManagerService } from './portfolio-manager.service';

@Module({
  controllers: [PortfolioManagerController],
  providers: [PortfolioManagerService]
})
export class PortfolioManagerModule {}
