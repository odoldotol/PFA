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

  let getPriceSpy: jest.SpyInstance;
  let subscribeAssetAndGetPriceSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        { provide: SubscriberService, useValue: {} },
        {
          provide: AccessorService,
          useValue: {
            getPrice: jest.fn((ticker: Ticker) => {
              if (ticker === mockApple.symbol) {
                return Promise.resolve(mockApple);
              } else return Promise.resolve(null);
            }),
            subscribeAssetAndGetPrice: jest.fn((ticker: Ticker) => {
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

    getPriceSpy = jest.spyOn(accessorService, 'getPrice');
    subscribeAssetAndGetPriceSpy = jest.spyOn(accessorService, 'subscribeAssetAndGetPrice');
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
      await assetController.getPrice(
        mockApple.symbol,
        mockResponse
      );
      expect(getPriceSpy).toHaveBeenCalledTimes(1);
      expect(getPriceSpy).toHaveBeenCalledWith(mockApple.symbol);
      expect(subscribeAssetAndGetPriceSpy).not.toHaveBeenCalled();
      expect(responseStatusSpy).toHaveBeenCalledTimes(1);
      expect(responseStatusSpy).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseSendSpy).toHaveBeenCalledTimes(1);
      expect(responseSendSpy)
      .toHaveBeenCalledWith(new GetPriceByTickerResponse(mockApple));
    });

    it('should return 201 and asset', async () => {
      await assetController.getPrice(
        mockSamsungElec.symbol,
        mockResponse
      );
      expect(getPriceSpy).toHaveBeenCalledTimes(1);
      expect(getPriceSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
      expect(subscribeAssetAndGetPriceSpy).toHaveBeenCalledTimes(1);
      expect(subscribeAssetAndGetPriceSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
      expect(responseStatusSpy).toHaveBeenCalledTimes(1);
      expect(responseStatusSpy).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(responseSendSpy).toHaveBeenCalledTimes(1);
      expect(responseSendSpy)
      .toHaveBeenCalledWith(new GetPriceByTickerResponse(mockSamsungElec));
    });

    it('should throw NotFoundException', async () => {
      const notFoundTicker = "notFoundTicker";
      await expect(assetController.getPrice(
        notFoundTicker,
        mockResponse
      )).rejects.toThrow(new NotFoundException(
        `Could not find Ticker: ${notFoundTicker}`
      ));
      expect(getPriceSpy).toHaveBeenCalledTimes(1);
      expect(getPriceSpy).toHaveBeenCalledWith(notFoundTicker);
      expect(subscribeAssetAndGetPriceSpy).toHaveBeenCalledTimes(1);
      expect(subscribeAssetAndGetPriceSpy).toHaveBeenCalledWith(notFoundTicker);
    });
  });
});