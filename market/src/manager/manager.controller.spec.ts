import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Yf_info } from '../schema/yf_info.schema';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

describe('ManagerController', () => {
  let controller: ManagerController;
  const yf_infoModel = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerController],
      providers: [
        ManagerService,
        ConfigService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          }
        },
        {
          provide: getModelToken(Yf_info.name),
          useValue: yf_infoModel,
        }
      ]
    }).compile();

    controller = module.get<ManagerController>(ManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
