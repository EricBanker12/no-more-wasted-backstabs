module.exports = function noMoreWastedBackstabs(dispatch) {
	// constants
	const config = require('./config.js'),
	debug = false
	
	// variables
	let model,
	job,
	cid
	
	// get character id and class on log in
	dispatch.hook('S_LOGIN', 2, event => {
		model = event.model
		cid = event.cid
		job = (model - 10101) % 100
		if (debug) {console.log('job', job)}
	})
	
	// block no-target C_START_TARGETED_SKILL
	dispatch.hook('C_START_TARGETED_SKILL', 2, {order: -100}, event => {
		// get skill used
		let skill = event.skill - 0x4000000,
		skillBase = Math.floor(skill / 10000)
		if (debug) {console.log('skillBase', skillBase)}
		// if skill is in config
		if (debug) {console.log('config[job]', config[job])}
		if (config[job] && config[job][skillBase]) {
			if (debug) {console.log('config[job][skillBase]', config[job][skillBase])}
			// if skill has no target
			if (debug) {console.log('event.unk[0]', event.unk[0])}
			if (event.unk[0].unk1 == 0 && event.unk[0].unk2 == 0) {
				// block skill
				if (debug) {console.log('skill blocked')}
				fix_camera(event)
				return false
			}
		}
	})
	
	/*
	dispatch.hook('S_ACTION_END', 1, {order: -100}, event => {
		if (cid.equals(event.source)) {
			if (debug) {console.log('S_ACTION_END', event)}
		}
	})
	
	dispatch.hook('S_ACTION_STAGE', 1, {order: -100}, event => {
		if (cid.equals(event.source)) {
			if (debug) {console.log('S_ACTION_STAGE', event)}
		}
	})
	*/
	
	// simulate cannot travel to that location
	function fix_camera(data) {
		// S_ACTION_STAGE
		dispatch.toClient('S_ACTION_STAGE', 1, {
			source: cid,
			x: data.x,
			y: data.y,
			z: data.z,
			w: data.w,
			model: model,
			skill: data.skill,
			stage: 0,
			speed: 1,
			id: 55555555,
			unk: 1,
			unk1: 0,
			toX: data.toX,
			toY: data.toY,
			toZ: data.toZ,
			unk2: 0,
			unk3: 0,
			movement: []
		})
		
		// S_ACTION_END
		dispatch.toClient('S_ACTION_END', 1, {
			source: cid,
			x: data.x,
			y: data.y,
			z: data.z,
			w: data.w,
			model: model,
			skill: data.skill,
			type: 19,
			id: 55555555
		})
	}
	
}