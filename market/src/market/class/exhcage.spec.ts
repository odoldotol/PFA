import { mockChildApiService } from "../mock/childApiService";
import { Exchange } from "./exchange";

describe("Exchange", () => {

  describe("id", () => {
    it("should return ISO_Code", () => {
      const exchange = new Exchange({
        market: "market",
        ISO_Code: "ISO_Code",
        ISO_TimezoneName: "ISO_TimezoneName",
      }, mockChildApiService);
      expect(exchange.id).toBe("ISO_Code");
    });
  });

  

});