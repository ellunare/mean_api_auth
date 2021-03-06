const express = require('express');
const router = express.Router();
const config = require('../config/database')

const passport = require('passport');

const PROTECT = passport.authenticate('jwt', { session: false });

// // // // // // // // // // // // // // // // // // // // // //

const Team = require('../models/team');

// Get All Teams
router.get('/teams', PROTECT, (req, res, next) => {

	Team.getAllTeams((err, teams) => {
		if (err) {
			throw err;
		}
		if (!teams) {
			res.json({
				success: false,
				msg: 'TEAS Teams not found',
				data: null
			});
		}
		else {
			res.json({
				success: true,
				msg: 'TEAS Teams send',
				data: teams
			});
		}
	});
});


// Add Teams
router.post('/team_add', PROTECT, (req, res, next) => {
	let name = req.body.name;

	// Есть ли такое название
	Team.getTeamByName(name, (err, team_check) => {
		if (err) {
			throw err;
		}
		if (!team_check) {
			// Назначаем новый id
			Team.getLastTeamId((err, lastTeam) => {
				if (err) {
					console.log('TEAS Cant find last team');
				}
				else {
					// Формируем новую команду
					let newTeam = new Team({
						id: lastTeam.id + 1,
						name: name,
					});

					Team.addTeam(newTeam, (err, team) => {
						if (err) {
							res.json({
								success: false,
								msg: 'TEAS Team creation error',
								data: null
							});
						}
						else {
							res.status(201).json({
								success: true,
								msg: 'TEAS Team ' + newTeam.name + ' added',
								data: newTeam
							});
						}
					});
				}
			});
		}
		else {
			res.json({
				success: false,
				msg: 'Team already exists',
				data: null
			});
		}
	});
});


// Delete Team By Id
router.delete('/team/:id', PROTECT, (req, res, next) => {
	let id = req.params.id;

	Team.deleteTeam(id, (err, response) => {
		if (err) {
			throw err;
		}
		if (!response) {
			res.json({
				success: false,
				msg: 'TEAS Team not found'
			});
		}
		else {
			res.json({
				success: true,
				msg: 'TEAS Team ' + id + ' deleted'
			});
		}
	});
});


module.exports = router;