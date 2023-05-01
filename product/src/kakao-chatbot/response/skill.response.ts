import { ApiProperty } from "@nestjs/swagger";

// TODO: SkillResponse 구현
export abstract class SkillResponse implements SkillResponseI {
    
    @ApiProperty()
    readonly version!: string;
    @ApiProperty()
    readonly template!: object;
    @ApiProperty()
    readonly context!: object;
    @ApiProperty()
    readonly data!: object;
}