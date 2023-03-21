import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { MarketModule } from './market/market.module';
import { KakaoCBModule } from './kakaoCB/kakaoCB.module';
import { Pm2Module } from './pm2/pm2.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.development.local"
    }),
    Pm2Module,
    MarketModule,
    KakaoCBModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
