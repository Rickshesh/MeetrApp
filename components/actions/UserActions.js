export const UPDATE_DRIVER = 'UPDATE_DRIVER'
export const UPDATE_BANK_DETAILS = 'UPDATE_BANK_DETAILS'
export const UPDATE_AUTO_DETAILS = 'UPDATE_AUTO_DETAILS'
export const UPDATE_DRIVER_ID = 'UPDATE_DRIVER_ID'
export const DELETE_DRIVER_ATTRIBUTE = 'DELETE_DRIVER_ATTRIBUTE'
export const UPDATE_IMAGES = 'UPDATE_IMAGES'



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

export function updateDriverId(id) {
    return {
        type: UPDATE_DRIVER_ID,
        payload: id,
    }
}

export function deleteDriverAttribute(attribute) {
    return {
        type: DELETE_DRIVER_ATTRIBUTE,
        payload: attribute,
    }
}

export function updateImages(image) {
    return {
        type: UPDATE_IMAGES,
        payload: image,
    }
}