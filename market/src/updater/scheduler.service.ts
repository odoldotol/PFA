import { Injectable } from "@nestjs/common";
import { UpdaterJob } from "./class/job";

@Injectable()
export class UpdaterSchedulerService {

  // Todo: exchange 리팩터링 이후, Map key 를 리팩터링 된 exchange 에 맞게 변경 하기
  private readonly updaterJobMap: Map<string, UpdaterJob> = new Map();

  public addSchedule(exchange: string, nextTime: Date, job: any) {
    const updaterJob = new UpdaterJob()
    this.updaterJobMap.set(exchange, updaterJob);
    return updaterJob;
  }

  public getAllJob() {
    return this.updaterJobMap;
  }
}