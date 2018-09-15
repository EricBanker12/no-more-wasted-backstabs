module.exports = function noMoreWastedBackstabs(dispatch) {
    // constants
    const config = require('./config.js')

    const skillDistances = {
        0: { // Warrior
            22: 17 // Backstab
        },
        2: { // Slayer
            6: 17 // Backstab
        },
        10: { // Brawler
            20: 30 // Meat Grinder
        },
        11: { // Ninja
            7: 17 // Decoy
        },
        12: { // Valkyrie
            20: 17 // Backstab
        }
    }

    const bigMobs = {
        950: { // Harrowhold
            1100: 3, // Ignidrax
            1101: 3, // Terradrax
            1102: 3, // Umbradrax
            1103: 3 // Aquadrax
        }
    }

    // variables
    let job,
        mobs = {}

    // get mob location
    function updateLoc(event) {
        let gameId = String(event.gameId)
        if (mobs[gameId]) {
            mobs[gameId].loc = event.loc
            mobs[gameId].w = event.w
        }
    }

    // get character class on log in
    dispatch.hook('S_LOGIN', 10, event => { job = (event.templateId - 10101) % 100 })

    // S_SPAWN_NPC
    dispatch.hook('S_SPAWN_NPC', 9, {order: 300, filter: {fake: null}}, event => {
        // if HH P1 dragon
        if (bigMobs[event.huntingZoneId] && bigMobs[event.huntingZoneId][event.templateId]) {
            // track position
            mobs[String(event.gameId)] = {
                huntingZoneId: event.huntingZoneId,
                templateId: event.templateId,
                loc: event.loc,
                w: event.w
            }
        }
    })

    //S_NPC_LOCATION
    dispatch.hook('S_NPC_LOCATION', 3, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    //S_ACTION_STAGE
    dispatch.hook('S_ACTION_STAGE', dispatch.base.majorPatchVersion >= 75 ? 8 : 7, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    //S_ACTION_END
    dispatch.hook('S_ACTION_END', 5, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    // S_DESPAWN_NPC
    dispatch.hook('S_DESPAWN_NPC', 3, {order: 300, filter: {fake: null}}, event => {
        let gameId = String(event.gameId)
        if (mobs[gameId]) delete mobs[gameId]
    })

    // block no-target C_START_TARGETED_SKILL
    dispatch.hook('C_START_TARGETED_SKILL', 6, {order: -100}, event => {
        // get skill used
        let skill = event.skill.id //event.skill - 0x4000000,
            skillBase = Math.floor(skill / 10000)
        // if class and skill are in config
        if(config[job] && config[job][skillBase]) {
            // if skill has no target
            if(event.targets[0].id.equals(0)) {
                // block the skill usage
                Object.assign(event.skill, {type: 0, npc: false, huntingZoneId: 0, reserved: 0})
                dispatch.toClient('S_CANNOT_START_SKILL', 4, {
                    skill: event.skill
                })
                return false
            }
            else {
                // if bigMob (HH p1 dragons)
                let gameId = String(event.targets[0].id)
                if (mobs[gameId]) {
                    // get backside coordinates
                    let d = bigMobs[mobs[gameId].huntingZoneId][mobs[gameId].templateId],
                        x = Math.cos(mobs[gameId].w) * d * 25,
                        y = Math.sin(mobs[gameId].w) * d * 25,
                        sqrDistance = event.loc.sqrDist2D(mobs[gameId].loc.subN({x:x, y:y, z:0}))
                    // if too far away
                    if (sqrDistance > (skillDistances[job][skillBase] * 25) ^ 2) {
                        // block the skill usage
                        Object.assign(event.skill, {type: 0, npc: false, huntingZoneId: 0, reserved: 0})
                        dispatch.toClient('S_CANNOT_START_SKILL', 4, {
                            skill: event.skill
                        })
                        return false
                    }
                }
            }
        }
    })
}
