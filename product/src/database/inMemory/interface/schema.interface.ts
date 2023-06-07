// Todo: schema 만들기
interface InMemorySchemaI {
    new <T>(v: T): T;
    get keyPrefix(): string;
    get ttl(): number;
}