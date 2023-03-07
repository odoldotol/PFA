import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MarketModule } from './market/market.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.development.local"
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [],
    //   useFactory: () => ({
    //     type: 'postgres',
    //     host: 'localhost',
    //     port: 5432,
    //     username: 'gyu',
    //     password: '',
    //     database: 'pfa_dev',
    //     entities: [], //
    //     synchronize: true, //
    //     // logging: true, //
    //     autoLoadEntities: true, //
    //   }),
    //   inject: [],
    // }),
    MarketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // constructor(private dataSource: DataSource) {}
}
