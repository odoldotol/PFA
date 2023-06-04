// Todo: schema 만들기
interface InMemorySchemaI extends Function {
    new <T>(v: T): T;
}