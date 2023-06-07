interface MarketDateI extends String {
    get get(): string;
    get keyPrefix(): string;
    get ttl(): number;
}