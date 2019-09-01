module.exports = function noMoreWastedBackstabs(dispatch) {
    // constants
    const config = require('./config.js'),
        Vec3 = require('tera-vec3'),
        debug = false

    const skillDistances = {
        0: { // Warrior
            22: 30 // Backstab
        },
        2: { // Slayer
            6: 30 // Backstab
        },
        10: { // Brawler
            20: 100 // Meat Grinder
        },
        11: { // Ninja
            7: 30 // Decoy
        },
        12: { // Valkyrie
            20: 30 // Backstab
        }
    }

    const bigMobs = {
        950: { // Harrowhold
            1100: 3, // Ignidrax
            1101: 3, // Terradrax
            1102: 3, // Umbradrax
            1103: 3 // Aquadrax
        }/*,
        // Testing BAM (Because HH requires having friends! ;_;)
        13: { // Island of Dawn
            7007: 2 // Brutal Naga Battlemaster
        }
        */
    }

    // variables
    let job,
        mobs = []

    // get mob location
    function updateLoc(event) {
        for (let mob of mobs) {
            if (mob.gameId == event.gameId) {
                mob.loc = event.loc
                mob.w = event.w
            }
        }
    }

    // get character class on log in
    dispatch.hook('S_LOGIN', 13, event => { job = (event.templateId - 10101) % 100 })

    // S_SPAWN_NPC
    dispatch.hook('S_SPAWN_NPC', 11, {order: 300, filter: {fake: null}}, event => {
        // if HH P1 dragon
        if (bigMobs[event.huntingZoneId] && bigMobs[event.huntingZoneId][event.templateId]) {
            // track position
            mobs.push({
                gameId: event.gameId,
                huntingZoneId: event.huntingZoneId,
                templateId: event.templateId,
                loc: event.loc,
                w: event.w
            })
        }
    })

    //S_NPC_LOCATION
    dispatch.hook('S_NPC_LOCATION', 3, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    //S_ACTION_STAGE
    dispatch.hook('S_ACTION_STAGE', 9, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    //S_ACTION_END
    dispatch.hook('S_ACTION_END', 5, {order: 300, filter: {fake: null}}, event => {
        updateLoc(event)
    })

    // S_DESPAWN_NPC
    dispatch.hook('S_DESPAWN_NPC', 3, {order: 300, filter: {fake: null}}, event => {
        for (let index in mobs) {
            if (mobs[index].gameId == event.gameId) {
                mobs.splice(index, 1)
            }
        }
    })

    // block no-target C_START_TARGETED_SKILL
    dispatch.hook('C_START_TARGETED_SKILL', 7, {order: -100}, event => {
        // get skill used
        let skill = event.skill.id,
            skillBase = Math.floor(skill / 10000)
        // if class and skill are in config
        if(config[job] && config[job][skillBase]) {
            let gameId = event.targets[0].id
            // if skill has no target
            if(gameId == 0) {
                if (debug) console.log('No target')
                // block the skill usage
                Object.assign(event.skill, {type: 0, npc: false, huntingZoneId: 0, reserved: 0})
                dispatch.toClient('S_CANNOT_START_SKILL', 4, {
                    skill: event.skill
                })
                return false
            }
            else {
                // if bigMob (HH p1 dragons)
                for (let mob of mobs) {
                    if (mob.gameId == gameId) {
                        // get backside coordinates
                        let d = bigMobs[mob.huntingZoneId][mob.templateId],
                            sqrDistance = event.loc.sqrDist2D(mob.loc.subN(new Vec3(d*25,0,0).rotate(mob.w)))
                        if (debug) {
                            let distance = Math.round(event.loc.sqrDist2D(mob.loc) ** 0.5 / 25)
                            console.log('distance =', distance, 'm | back =', Math.round(sqrDistance ** 0.5 / 25), 'm')
                        }
                        // if too far away
                        if (sqrDistance > (skillDistances[job][skillBase] * 25) ** 2) {
                            if (debug) console.log('Too far away')
                            // block the skill usage
                            Object.assign(event.skill, {type: 0, npc: false, huntingZoneId: 0, reserved: 0})
                            dispatch.toClient('S_CANNOT_START_SKILL', 4, {
                                skill: event.skill
                            })
                            return false
                        }
                        return null
                    }
                }
            }
        }
    })
}
