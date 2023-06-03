interface InMemoryRepositoryI<T> {
    // Todo: null 반환 하지 말고 에러 던져야함
    createOne: (key: string, value: T) => Promise<T|null>;
    findOne: (key: string) => Promise<T|null>;
    // Todo: null 반환 하지 말고 에러 던져야함
    updateOne: (key: string, update: Partial<T>) => Promise<T|null>;
    deleteOne: (key: string) => Promise<boolean>;

    /**
     * ### 사용주의 - copy 하지 않은 원본 객체를 반환함.
     */
    get: (key: string) => Promise<T|null>;
    copy: (v: T | null ) => T | null;
}