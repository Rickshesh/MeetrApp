export const UPDATE_DRIVER = 'UPDATE_DRIVER'

export function updateDriver(driver) {
    return {
        type: UPDATE_DRIVER,
        payload: driver,
    }
}
