module.exports = function noMoreWastedBackstabs(dispatch) {
	// constants
	const config = require('./config.js')

	// variables
	let job

	// get character id and class on log in
	dispatch.hook('S_LOGIN', 2, event => { job = (event.model - 10101) % 100 })

	// block no-target C_START_TARGETED_SKILL
	dispatch.hook('C_START_TARGETED_SKILL', 3, {order: -100}, event => {
		// get skill used
		let skill = event.skill - 0x4000000,
			skillBase = Math.floor(skill / 10000)

		if(config[job] && config[job][skillBase]) {
			if(event.targets[0].id.equals(0)) {
				dispatch.toClient('S_CANNOT_START_SKILL', 1, {skill: event.skill})
				return false
			}
		}
	})
}