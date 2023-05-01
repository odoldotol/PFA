import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Asset { // 유가 쓰거나 수정,삭제할 수 없는 테이블
/*
    @PrimaryGeneratedColumn()
    id: number;

    // many to one
    // @Column()
    // account:

    // 생성&수정일시
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // 최근 엑섹스 일시 ??

    // 포트폴리오 종속 many to many
    
    @ Column()
    amount: number;
*/

    // -------------------------------------------------- lapiki
    // # 포멧 종속
    // format = models.ForeignKey(to=AssetFormat, on_delete=models.PROTECT)
    
    // # dataportfolio 분류
    // classi = models.CharField(max_length=50)
    // ### 참고 ###
    // # ## classi = dataportfolio 에서 연산할떄 분류(유저에게 보여주는 분류)
    // # a : 주식
    // # b : 크립토
    // # c : 통화
    // # d : 통화 기반 saving
    // classi_list = ['a', 'b', 'c', 'd']
    
    // # asset 코드(특정할 수 있는 고유한 코드)
    // code = models.CharField(max_length=50)

    // # asset title(대표하는)
    // title = models.CharField(max_length=100)

    // # asset 이름
    // name = models.CharField(max_length=100)

    // # asset 속성(필요한 asset에만 사용)
    // attribute = models.CharField(max_length=100)
}