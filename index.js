module.exports = function noMoreWastedBackstabs(dispatch) {
    // constants
    const config = require('./config.js')

    // variables
    let job

    // get character class on log in
    dispatch.hook('S_LOGIN', 10, event => { job = (event.templateId - 10101) % 100 })

    // block no-target C_START_TARGETED_SKILL
    dispatch.hook('C_START_TARGETED_SKILL', dispatch.base.majorPatchVersion >= 74 ? 6 : 5, {order: -100}, event => {
        // get skill used
        let skill = event.skill.id //event.skill - 0x4000000,
            skillBase = Math.floor(skill / 10000)
        // if class and skill are in config
        if(config[job] && config[job][skillBase]) {
            // if skill has no target
            if(event.targets[0].id.equals(0)) {
                // block the skill usage
                Object.assign(event.skill, {type: 0, npc: false, huntingZoneId: 0, reserved: 0})
                dispatch.toClient('S_CANNOT_START_SKILL', dispatch.base.majorPatchVersion >= 74 ? 4 : 3, {
                    skill: event.skill
                })
                return false
            }
        }
    })
}
