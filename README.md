# webapp-farmingsim

Welcome to farming simulator!!!! In here, you're a very simple farmer who needs to buy the other land and **DOMINATE THE FARMING INDUSTRY!!!**. Just farm, sell, and buy!!!!.
This is a game for week 6 of [Siege](https://sieg.hackclub.com/), and this week's theme is "Grid". So naturally, this fits the theme because of the grid-like pattern of the land plots, and how the user has to farm in a grid-like pattern (I have such a big big brain...)

## How to play?

- Use W/S for movement and A/D for rotation
- Press `"b"` or click the number below `land` in the left box to get into land-selector mode
    - Use arrows to navigate which plot you wish to buy
    - Press `enter` to buy that selected plot
    - Press `esc` to cancel the purchase
- Sell your crop after harvesting!!!
    - A button will automatically appear in the bottom left
    - Click that, set the price, sell your crop
- Nothing else really, it's kinda simple...

## Credits

- Art by me
- Sounds from [SoundJay](https://www.soundjay.com/)
    - [Tractor sounds collection](https://www.soundjay.com/tractor-sound-effects.html)
        - [tractor-idling-01.mp3](https://www.soundjay.com/transportation/sounds/tractor-idling-01.mp3)
        - [tractor-reversing-01.mp3](https://www.soundjay.com/transportation/sounds/tractor-reversing-01.mp3)
        - [tractor-working-03.mp3](https://www.soundjay.com/transportation/sounds/tractor-working-03.mp3)
    - [White Noise collection](https://www.soundjay.com/misc-sounds-2.html)
        - [white-noise-02.mp3](https://www.soundjay.com/misc/sounds/white-noise-02.mp3)

## SCOOBY TOBI DOOOOOO

- [ ] Farm land
    - [x] Should be divided into 9 chunks, the player initially has access to the bottom right chunk
    - [ ] Other chunks can be bought for a certain price, with their price being different depending on how far they are
    - [x] User cannot go onto unpurchased land
- [ ] A tractor
    - [x] Should be controllable via wasd
    - [ ] Should be upgradable?
- [ ] Info panel
    - [x] Contains info of current crop
        - [x] Info of current growth of crop
        - [x] Info on type of crop (has currently only got wheat)
    - [ ] Info on tractor durability
        - The more they move the tractor in un-cropped land, the more it's durability decreases?
        - I dont really think this would be needed cause tractors are stronk af
    - [x] Time progression
- [x] Ability to buy neighbouring land
    - [x] Considering the game container would be divided into 9 parts, and user has initially only 1 part
    - [x] Can use arrow keys to navigate land purchase
    - [x] Hotkey for land perch start (`b`)
- [x] Music & Sounds
    - [x] Background music (tractor idle)
    - [x] Tractor noises brrrr
    - [ ] Crop cropping noises (whitenoise?)
- [x] Some kinda animation difference from harvested crop vs growing crop
    - [x] Growing crop should go from green to slight yellow
    - [x] Harvesting crop should leave darker patches of yellow in harvested area
    - [x] Re-tilling the soil would leave dirt colour
    - [x] Then the user has to re-plant new seeds

## Devlogs

- 4 November 2025
    - Created `index.html`, `styles.css`, and `scripts/`
    - Created the basic board
        - Has a border
        - Is right aligned
        - thinking that left will have the status of different seasons and everything?
    - Added a tractor
        - Player can move with wasd
            - w/s pushes forwards/backwards
            - a/d turns right/left
    - Added a info window
        - Has year, crop, day, and progress
        - Nothing works as of yet tho
- 5 November 2025
    - Added tilling mechanics
        - Land looks like dirt initially
        - Move the tractor over it, and boom! you tilled the land
        - You can also make some pretty cool stuff with this...
    - Tried to add land buying mechanics
        - Not really working out rn, will have to think it over a bit more
- 6 November 2025
    - Added land purchase options
        - Can now use arrow keys to navigate and purchase the land
        - Bad touching the land button, or pressing `b` starts the purchase thing
        - There's a confirmation dialogue as well now
            - Enter gives yes
            - Esc gives no
        - Can ONLY buy land adjacent to the ones you own
        - Tractor can only move to the land user owns
        - Added planting function
            - When 80% of the land is tilled (tillet??) then a box would pop up
            - Box basically tells them they gotta seed the ground (calm down buddy)
- 7 November 2025
    - Tried to fix the out of land bounds issue, realised it's just a monitor problem
        - Needed to till a bit outisde of owned land to be able to reach that 80% seed planting threshold
        - Changed my monitor, and boom, somehow it's fixed
        - I aint going back to it then
        - Lol, didn't do much huh
- 8 November 2025
    - I forgor
- 9 November 2025
    - Added wheat harvesting system
    - Added wheat selling system
        - Sill gonna work on the selling mechanics and stuff
        - Also gotta work on what getting more money really does... like, seriously...
    - MASSIVLY updated the harvesting system
        - untilled land was blotchyly getting tilled for some reason under the harvest
        - Just used a simple fix to make it WAYYY close...
- 10 November 2025
    - Added sounds
    - Updated tractor movement
        - It's a little slower now
        - Reversing doesn't till anymore
    - Added land buying systems
        - 1st row is 500 usd
        - 2nd row is 1k usd
        - 3rd row is 2k usd