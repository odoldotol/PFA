import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
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
  ],
  providers: [],
  exports: [],
})
export class PostgreModule {
  // constructor(private dataSource: DataSource) {}
}
