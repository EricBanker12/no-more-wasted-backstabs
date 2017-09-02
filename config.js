module.exports = {
    0: { // Warrior
        22: true // Backstab
    },
    2: { // Slayer
        // I don't have a slayer to test, so not sure if this works.
        // But it should work same as warrior, so I left it true.
        6: true // Backstab
    },
    10: { // Brawler
        // Known Issue: Using Meat Grinder on a target in-range 
        // but not knocked up will still consume the cooldown.
        20: true // Meat Grinder
    },
    11: { // Ninja
        // I don't have a ninja to test, so not sure if this works.
        // Change to true to enable.
        7: false // Decoy
    },
    12: { // Valkyrie
        // I don't have a valkyrie to test, so not sure if this works.
        // Change to true to enable.
        20: false // Backstab
    }
}
