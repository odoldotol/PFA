interface RedisServiceI {
    setOne: <T>([key, value, ttl]: [string, T, number]) => Promise<T|null>;
    deleteOne: (key: string) => Promise<any>;
    getOne: (key: string) => Promise<any>;
}