interface LogPriceUpdate {
    readonly launcher: "initiator" | "scheduler" | "admin" | "product" | "test"
    readonly isStandard: boolean
    readonly key: string | Array<string | Object>
    readonly success: UpdatePriceSet[]
    readonly failure: any[]
    readonly startTime: string
    readonly endTime: string
    readonly duration: number
}