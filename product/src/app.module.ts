import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AaaManagerModule } from './aaa-manager/aaa-manager.module';

@Module({
  imports: [
    AuthModule,
    PortfolioModule,
    AaaManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
