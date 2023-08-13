import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from "./exchange.entity";

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>
  ) {}

}
