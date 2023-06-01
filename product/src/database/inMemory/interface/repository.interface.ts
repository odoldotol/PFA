interface InMemoryRepositoryI<T> {
    // Todo: null 반환 하지 말고 에러 던져야함
    createOne: (key: string, value: T) => Promise<T|null>;
    findOne: (key: string) => Promise<T|null>;
    updateOne: (key: string, update: Partial<T>) => Promise<T|null>;
    deleteOne: (key: string) => Promise<T>;
}