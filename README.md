# The Monochord

A small webapp on listening to harmonics and subharmonics and to learn how they interact with each other by ear.

https://the-monochord.com/

![preview of how the monochord looks in the browser](preview.jpg?raw=true 'preview of how the monochord looks in the browser')

## URL parameters

### mode

Possible values: `harmonics` and `subharmonics`

Default value is `harmonics` (controlled by `DEFAULT_MODE`)

### base-frequency

Possible values: any integer between `50` and `10.000` (controlled by `MIN_BASE_FREQUENCY` and `MAX_BASE_FREQUENCY`)

Default value is `440` (controlled by `DEFAULT_BASE_FREQUENCY`)
