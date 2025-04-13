import { Injectable } from "@nestjs/common";
import {
  InquireQuery,
  Ticker
} from "src/common/interface";

@Injectable()
export class YahooFinanceTickerService {

  /**
   * 영어 또는 숫자만 가지는지   
   * 길이가 1~20 인지  
   * 특수문자는 . 한가지 총 한개만 가지거나 아예 안가짐, 뛰어쓰기 등도 가지지 않음  
   * . 뒤에는 2자리의 영어를 가짐  
   */
  public isStyle(
    query: InquireQuery
  ): boolean {;
    return /^[a-zA-Z0-9]{1,20}(\.[a-zA-Z]{2})?$/.test(query);
  }

  /**
   * Not Implemented
   */
  public async readCache(
    query: InquireQuery
  ): Promise<Ticker[] | null> {
    query.toUpperCase();
    return null;
  }

  /**
   * Not Implemented
   */
  public async fetchFromModel(
    query: InquireQuery
  ): Promise<Ticker[]> {
    // exception 처리
    query; //
    return [];
  }

  /**
   * Not Implemented
   */
  public async inquire(
    query: InquireQuery
  ): Promise<Ticker[]> {
    const cache = await this.readCache(query);
    if (cache !== null) {
      return cache;
    } else {
      return this.fetchFromModel(query);
    }
  }

}
