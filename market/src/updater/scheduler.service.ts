import { Injectable } from "@nestjs/common";
import { UpdaterJob } from "./class/job";

@Injectable()
export class UpdaterSchedulerService {

  addSchedule(exchange: string, nextTime: Date, job: any) {
    return new UpdaterJob();
  }
}