interface ExchangeSession {
    readonly previous_open: string
    readonly previous_close: string
    readonly next_open: string
    readonly next_close: string
}

interface ExchangeSessionError {
    readonly doc: string
    readonly ISO_Code: string
}