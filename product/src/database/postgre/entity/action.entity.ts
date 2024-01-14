// import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// @Entity()
export class Action {
/*
    @PrimaryGeneratedColumn()
    id: number;

    // 생성&수정일시
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
*/
    // -------------------------------------------------- lapiki
    // DEFAULT = 'DF'
    // QUICK = 'QK'
    // TRADE = 'TD'
    // INOUT = 'IO'
    // INSIDE = 'IS'
    // USER = 'US'
    // INTEREST = 'IR'
    // DIVIDEND = 'DD'
    // RENT = 'RT'
    // PAY = 'PY'

    // action_rabels = [
    //     (DEFAULT, 'default'),
    //     (QUICK, '빠른생성'),
    //     (TRADE, '거래'),
    //     (INOUT, '입출'),
    //     (INSIDE, '내부거래'),
    //     (USER, '수정'),
    //     (INTEREST, '이자'),
    //     (DIVIDEND, '배당'),
    //     (RENT, '월세'),
    //     (PAY, '급여'),
    // ]
    
    // # 실제 액션 일시
    // action_time = models.DateTimeField(auto_now_add=True)
    // # buy/sell asset 종속
    // asset_buy = models.ForeignKey(to=AccountsAsset, null=True, on_delete=models.PROTECT, related_name='action_asset_buy')
    // asset_sell = models.ForeignKey(to=AccountsAsset, null=True, on_delete=models.PROTECT, related_name='action_asset_sell')
    // # buy/sell 수량
    // amount_buy = models.FloatField(default=0)
    // amount_sell = models.FloatField(default=0)
    // # 라벨링
    // rabel = models.CharField(
    //     max_length=2,
    //     choices=action_rabels,
    //     default=DEFAULT,
    // )
    // # 특정 account 종속
    // account_buy = models.ForeignKey(to=PortfoliosAccount, null=True, on_delete=models.PROTECT, related_name='action_account_buy')
    // account_sell = models.ForeignKey(to=PortfoliosAccount, null=True, on_delete=models.PROTECT, related_name='action_account_sell')
    // # portfolio 종속
    // portfolio = models.ForeignKey(to=Portfolio, on_delete=models.PROTECT)
}