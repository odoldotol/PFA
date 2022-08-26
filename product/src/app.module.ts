import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AaaManagerModule } from './aaa-manager/aaa-manager.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'gyu',
        password: '',
        database: 'pfa_dev',
        entities: [], //
        synchronize: true, // 앱 실행할때마다 자동으로 동기화함. 개발할때 편한기능, 배포버젼에서는 위험한기능.
        // logging: true, //
        autoLoadEntities: true, //
      }),
      inject: [],
    }),
    AuthModule,
    PortfolioModule,
    AaaManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
