export const UPDATE_DRIVER = 'UPDATE_DRIVER'
export const UPDATE_BANK_DETAILS = 'UPDATE_BANK_DETAILS'
export const UPDATE_AUTO_DETAILS = 'UPDATE_AUTO_DETAILS'

export function updateDriver(driver) {
    return {
        type: UPDATE_DRIVER,
        payload: driver,
    }
}

export function updateBankDetails(bank) {
    return {
        type: UPDATE_BANK_DETAILS,
        payload: bank,
    }
}

export function updateAutoDetails(auto) {
    return {
        type: UPDATE_AUTO_DETAILS,
        payload: auto,
    }
}