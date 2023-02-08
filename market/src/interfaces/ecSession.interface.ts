interface OkEcSession {
    previous_open: string
    previous_close: string
    next_open: string
    next_close: string
}

interface ErEcSession {
    error: {
        doc: string
        ISO_Code: string
        arg?: any
    }
}

export { OkEcSession, ErEcSession }