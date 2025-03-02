# The Monochord

A small webapp on listening to harmonics and subharmonics and to learn how they interact with each other by ear.

https://the-monochord.com/

![preview of how the monochord looks in the browser](preview.jpg?raw=true 'preview of how the monochord looks in the browser')

## URL parameters

### mode

Possible values: `harmonics` and `subharmonics`

Default value is `harmonics` (controlled by `DEFAULT_MODE`)

### base-frequency

Possible values: any integer between `200` and `2.000` (controlled by `MIN_BASE_FREQUENCY` and `MAX_BASE_FREQUENCY`)

Default value is `440` (controlled by `DEFAULT_BASE_FREQUENCY`)

## number-of-voices

Possible values: any integer between `4` and `16` (controlled by `MIN_NUMBER_OF_VOICES` and `MAX_NUMBER_OF_VOICES`)

Default value is `8` (controlled by `DEFAULT_NUMBER_OF_VOICES`)

## Interesting presets

- raspy 16 part harmonic series: https://the-monochord.com?mode=harmonics&base-frequency=200&number-of-voices=16
- high pitched subharmonics: https://the-monochord.com/?mode=subharmonics&base-frequency=1500&number-of-voices=6
