import { Injectable } from "@nestjs/common";
import { Exchange } from "./class/exchange";

@Injectable()
export class ExchangeContainer {

  private readonly exchanges = new Map<Exchange["id"], Exchange>();

  public add(exchange: Exchange) {
    const id = exchange.id;
    if (this.exchanges.has(id)) {
      throw new Error("Already exists exchange");
    }
    this.exchanges.set(id, exchange);
  }

}