/**
 * This function transforms the feature from reverse geocoding to plain text with specified accuracy
 * @param {object} feature
 * @param {string | ((info: object) => string)} accuracy
 * @returns {string}
 */
export function transformFeatureToGeolocationText(feature: object, accuracy: string | ((info: object) => string)): string;
/**
 * This function transforms the feature from reverse geocoding to AddressInfo object
 * @param {object} feature
 * @returns {object}
 */
export function getAddressInfo(feature: object): object;
export const REVERSE_GEOCODE_COORD_RGX: RegExp;
//# sourceMappingURL=utils.d.ts.map