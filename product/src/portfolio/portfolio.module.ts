import { Module } from '@nestjs/common';
import { PortfolioManagerModule } from './portfolio-manager/portfolio-manager.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [PortfolioManagerModule],
  controllers: [PortfolioController],
  providers: [PortfolioService]
})
export class PortfolioModule {}
