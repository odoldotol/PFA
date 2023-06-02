// InMemorySchema 는 생성자 함수이다.
interface InMemorySchema extends Function {
    new <T>(v: T): T;
}