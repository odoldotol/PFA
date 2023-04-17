interface MarketDateI extends String {
    get: string;
    isEqualTo: (marketDate: MarketDateI | string) => boolean;
}