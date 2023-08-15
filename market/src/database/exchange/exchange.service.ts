import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Exchange } from "./exchange.entity";

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepo: Repository<Exchange>,
    private readonly dataSource: DataSource
  ) {}

}
