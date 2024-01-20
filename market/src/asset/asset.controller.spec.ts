import { Test } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { AssetController } from './asset.controller';
import { AccessorService, SubscriberService } from './service';
import { GetPriceByTickerResponse } from './response';
import { Ticker } from 'src/common/interface';
import { mockApple, mockSamsungElec } from "src/mock";

const mockResponse: Response = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('AssetController', () => {
  let assetController: AssetController;
  let accessorService: AccessorService;

  let getFinancialAssetSpy: jest.SpyInstance;
  let subscribeAssetAndGetSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        { provide: SubscriberService, useValue: {} },
        {
          provide: AccessorService,
          useValue: {
            getFinancialAsset: jest.fn((ticker: Ticker) => {
              if (ticker === mockApple.symbol) {
                return Promise.resolve(mockApple);
              } else return Promise.resolve(null);
            }),
            subscribeAssetAndGet: jest.fn((ticker: Ticker) => {
              if (ticker === mockSamsungElec.symbol) {
                return Promise.resolve(mockSamsungElec);
              } else throw new NotFoundException(
                `Could not find Ticker: ${ticker}`
              );
            }),
          }
        },
      ],
    }).compile();

    assetController = moduleRef.get(AssetController);
    accessorService = moduleRef.get(AccessorService);

    getFinancialAssetSpy = jest.spyOn(accessorService, 'getFinancialAsset');
    subscribeAssetAndGetSpy = jest.spyOn(accessorService, 'subscribeAssetAndGet');
  });

  describe('getPriceByTicker', () => {
    let responseStatusSpy: jest.SpyInstance;
    let responseSendSpy: jest.SpyInstance;

    beforeAll(() => {
      responseStatusSpy = jest.spyOn(mockResponse, 'status');
      responseSendSpy = jest.spyOn(mockResponse, 'send');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 200 and asset', async () => {
      await assetController.getPriceByTicker(
        mockApple.symbol,
        mockResponse
      );
      expect(getFinancialAssetSpy).toHaveBeenCalledTimes(1);
      expect(getFinancialAssetSpy).toHaveBeenCalledWith(mockApple.symbol);
      expect(subscribeAssetAndGetSpy).not.toHaveBeenCalled();
      expect(responseStatusSpy).toHaveBeenCalledTimes(1);
      expect(responseStatusSpy).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseSendSpy).toHaveBeenCalledTimes(1);
      expect(responseSendSpy)
      .toHaveBeenCalledWith(new GetPriceByTickerResponse(mockApple));
    });

    it('should return 201 and asset', async () => {
      await assetController.getPriceByTicker(
        mockSamsungElec.symbol,
        mockResponse
      );
      expect(getFinancialAssetSpy).toHaveBeenCalledTimes(1);
      expect(getFinancialAssetSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
      expect(subscribeAssetAndGetSpy).toHaveBeenCalledTimes(1);
      expect(subscribeAssetAndGetSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
      expect(responseStatusSpy).toHaveBeenCalledTimes(1);
      expect(responseStatusSpy).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(responseSendSpy).toHaveBeenCalledTimes(1);
      expect(responseSendSpy)
      .toHaveBeenCalledWith(new GetPriceByTickerResponse(mockSamsungElec));
    });

    it('should throw NotFoundException', async () => {
      const notFoundTicker = "notFoundTicker";
      await expect(assetController.getPriceByTicker(
        notFoundTicker,
        mockResponse
      )).rejects.toThrow(new NotFoundException(
        `Could not find Ticker: ${notFoundTicker}`
      ));
      expect(getFinancialAssetSpy).toHaveBeenCalledTimes(1);
      expect(getFinancialAssetSpy).toHaveBeenCalledWith(notFoundTicker);
      expect(subscribeAssetAndGetSpy).toHaveBeenCalledTimes(1);
      expect(subscribeAssetAndGetSpy).toHaveBeenCalledWith(notFoundTicker);
    });
  });
});