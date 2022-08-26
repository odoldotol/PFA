import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Account { // 일단은 입력 하든가 말든가 로 가지만, 그래도 진실되게(계죄의 정보는 달라도 실제 존재하는 계좌를 입력하고 그 안에 자산들도) 입력해야 다양한 서비스에서 더욱 도움을 받을 수 있다는 안내해주기. 추후에 수정이 어려울 수 있다는 점도 안내
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 100 })
    originalAccountId: string; // not required

    // 계좌 브랜드? 타이블? 분류? 종류? ex) 신한은행, 

    @Column("varchar", { length: 50 })
    originalAccountName: string; // not required

    @Column("varchar", { length: 20 })
    nickname: string; // required

    @Column("varchar", { length: 10000 })
    memo: string;

    // 생성&수정일시
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // 최근 엑섹스 일시 ??

    // 포트폴리오 종속 many to many

    // 유저 종속 many to one
    // @ManyToOne(() => User, (user) => user.accounts)
    // user: User;
}