import { Request } from "express";
import { ThrottlerGuard } from "@nestjs/throttler";

export class GlobalThrottlerGuard
  extends ThrottlerGuard
{
  protected override async getTracker(
    req: Request
  ): Promise<string> {
    let tracker;
    if (
      this.isNginxProxy(req) &&
      typeof (tracker = req.headers["x-forwarded-for"]) === "string"
    ) {
      return tracker;
    } else {
      return super.getTracker(req);
    }
  }

  private isNginxProxy(req: Request): boolean {
    return req.headers["x-nginx-proxy"] === "true";
  }
}
