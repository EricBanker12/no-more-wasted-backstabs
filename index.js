module.exports = function noMoreWastedBackstabs(dispatch) {
    // constants
    const config = require('./config.js')

    // variables
    let job

    // get character class on log in
    dispatch.hook('S_LOGIN', 2, event => { job = (event.model - 10101) % 100 })

    // block no-target C_START_TARGETED_SKILL
    dispatch.hook('C_START_TARGETED_SKILL', 3, {order: -100}, event => {
        // get skill used
        let skill = event.skill - 0x4000000,
            skillBase = Math.floor(skill / 10000)
        // if class and skill are in config
        if(config[job] && config[job][skillBase]) {
            // if skill has no target
            if(event.targets[0].id.equals(0)) {
                // block the skill usage
                dispatch.toClient('S_CANNOT_START_SKILL', 1, {skill: event.skill})
                return false
            }
        }
    })
}
