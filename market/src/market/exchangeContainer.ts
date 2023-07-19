import { Injectable } from "@nestjs/common";
import { Exchange } from "./class/exchange";

@Injectable()
export class ExchangeContainer {

  private readonly exchanges = new Map<Exchange["ISO_Code"], Exchange>();

  public add(exchange: Exchange) {
    const key = exchange.ISO_Code;
    if (this.exchanges.has(key)) {
      throw new Error("Already exists exchange");
    }
    this.exchanges.set(key, exchange);
  }

  public getOne(key: Exchange["ISO_Code"]) {
    return this.exchanges.get(key);
  }

}