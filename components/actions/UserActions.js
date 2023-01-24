export const UPDATE_DRIVER = 'UPDATE_DRIVER'
export const UPDATE_BANK_DETAILS = 'UPDATE_BANK_DETAILS'
export const UPDATE_AUTO_DETAILS = 'UPDATE_AUTO_DETAILS'
export const UPDATE_DRIVER_ATTRIBUTE = 'UPDATE_DRIVER_ATTRIBUTE'
export const DELETE_DRIVER_ATTRIBUTE = 'DELETE_DRIVER_ATTRIBUTE'
export const UPDATE_IMAGES = 'UPDATE_IMAGES'
export const RESET_DRIVER = 'RESET_DRIVER'
export const TOGGLE_ACCOUNT_SECTION = 'TOGGLE_ACCOUNT_SECTION'
export const UPDATE_MQTT_DATA = 'UPDATE_MQTT_DATA'

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

export function updateDriverAttribute(key, value) {
    return {
        type: UPDATE_DRIVER_ATTRIBUTE,
        payload: { key, value },
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

export function resetDriver() {
    return {
        type: RESET_DRIVER,
    }
}

export function toggleAccountSection() {
    return {
        type: TOGGLE_ACCOUNT_SECTION
    }
}

export function updateMQTTdata() {
    return {
        type: UPDATE_MQTT_DATA
    }
}