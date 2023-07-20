// Todo: Refac

type LogPriceUpdate = Readonly<{
    launcher: "initiator" | "scheduler" | "admin" | "product" | "test"
    isStandard: boolean
    key: string | Array<string | Object>
    success: UpdatePriceSet[]
    failure: any[]
    startTime: string
    endTime: string
    duration: number
}>