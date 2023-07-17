import { Test, TestingModule } from "@nestjs/testing";
import { UpdaterSchedulerService } from "./scheduler.service";
import { UpdaterJob } from "./class/job";

describe("SchedulerService", () => {

  let service: UpdaterSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdaterSchedulerService],
    }).compile();

    service = module.get<UpdaterSchedulerService>(UpdaterSchedulerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("addSchedule: 새로운 업데이터 스케줄 등록", () => {
    it("Exchange객체(임시: ISO_Code), 다음시간, 업데이트작업함수 받아서 스케줄 만들고 해당 Exchange 의 UpdaterJob 반환", () => {
      const job = service.addSchedule("XXXX", new Date(), () => {});
      expect(job).toBeInstanceOf(UpdaterJob);
    });
  });

  describe("모든 업데이터 스케줄 조회 메서드", () => {
    it.todo("등록된 모든 업데이터 잡 반환");
  });

});