// TODO: Refac
interface AddAssetsResponseI {
    readonly success: {
        info: FulfilledYfInfo[],
        status_price: StatusPrice[],
    },
    readonly failure: {
        info: any[],
        status_price: any[],
    }
};