import { Test } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { AssetController } from './asset.controller';
import { AccessorService, AdderService } from './service';
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

  let getPriceByTickerSpy: jest.SpyInstance;
  let addPriceByTickerSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        { provide: AdderService, useValue: {} },
        {
          provide: AccessorService,
          useValue: {
            getPrice: jest.fn((ticker: Ticker) => {
              if (ticker === mockApple.symbol) {
                return Promise.resolve(mockApple);
              } else return Promise.resolve(null);
            }),
            addAssetAndGetPrice: jest.fn((ticker: Ticker) => {
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

    getPriceByTickerSpy = jest.spyOn(accessorService, 'getPrice');
    addPriceByTickerSpy = jest.spyOn(accessorService, 'addAssetAndGetPrice');
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
      expect(getPriceByTickerSpy).toHaveBeenCalledTimes(1);
      expect(getPriceByTickerSpy).toHaveBeenCalledWith(mockApple.symbol);
      expect(addPriceByTickerSpy).not.toHaveBeenCalled();
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
      expect(getPriceByTickerSpy).toHaveBeenCalledTimes(1);
      expect(getPriceByTickerSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
      expect(addPriceByTickerSpy).toHaveBeenCalledTimes(1);
      expect(addPriceByTickerSpy).toHaveBeenCalledWith(mockSamsungElec.symbol);
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
      expect(getPriceByTickerSpy).toHaveBeenCalledTimes(1);
      expect(getPriceByTickerSpy).toHaveBeenCalledWith(notFoundTicker);
      expect(addPriceByTickerSpy).toHaveBeenCalledTimes(1);
      expect(addPriceByTickerSpy).toHaveBeenCalledWith(notFoundTicker);
    });
  });
});