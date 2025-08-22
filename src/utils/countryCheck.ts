import countryEnum from '@akashcapro/codex-shared-utils/dist/enums/countryCode.enum'

export const isValidCountry = (country : string) => {
    return Object.values(countryEnum).find(val => val===country);
}