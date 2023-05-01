import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Account {
/*
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 100 })
    originalAccountId: string; // not required

    // 계좌 브랜드? 타이틀? 분류? 종류? ex) 신한은행, 

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
*/
    // 최근 엑섹스 일시 ??

    // 포트폴리오 종속 many to many

    // 유저 종속 many to one // required
    // @ManyToOne(() => User, (user) => user.accounts)
    // user: User;



    // -------------------------------------------------- lapiki
    // # 필터
    // a = models.BooleanField(default=False, help_text="stocks, etf,,, exchange traded financial instruments")
    // b = models.BooleanField(default=False, help_text="crypto")
    // c = models.BooleanField(default=False, help_text="cash")
    // s = models.BooleanField(default=False, help_text="savings")
    // p = models.BooleanField(default=False, help_text="pension, retire, insurance, annuity,,,")
    // r = models.BooleanField(default=False, help_text="real estate")
    // z = models.BooleanField(default=False, help_text="painting, goods etc")
}