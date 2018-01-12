const express = require('express');
const router = express.Router();
const config = require('../config/database')

const passport = require('passport');
const jwt = require('jsonwebtoken');

const PROTECT = passport.authenticate('jwt', { session: false });

// // // // // // // // // // // // // // // // // // // // // //

const Section = require('../models/section');

router.get('/sections/project/:id', PROTECT, (req, res, next) => {
	let project_id = req.params.id;

	Section.getSectionsForProject(project_id, (err, sections) => {
		if (err) {
			throw err;
		}
		if (!sections.length) {
			return res.json({
				success: false,
				msg: 'SECS Sections not found',
				data: null
			});
		}
		else {
			res.json({
				success: true,
				msg: 'SECS Sections send',
				data: sections
			});
		}
	});
});


// Initialize new project with 3 sections
var async = require('async');

router.post('/sections_init', PROTECT, (req, res, next) => {
	let DEF = Section.DEF_sections;
	let parent_id = req.body.id;

	let no_errors = true;
	let return_array = [];

	// Создаем 3 стандартные секции у нового проекта

	let steps = [1, 2, 3];

	async.forEachOfLimit(steps, 1, function (__key, i, __ENDING) {

		async.waterfall([

			// Получаем последний индекс
			function GetID(next) {

				Section.getLastSectionId((err, LS) => {
					let send__lastSection;

					if (err) {
						send__lastSection = null;
					}
					else {
						send__lastSection = LS;
					}
					next(null, send__lastSection);
				})

			},

			// Создаем новую секцию
			function ADD(lastSection, next) {

				let newSection = new Section({
					id: lastSection.id + 1,
					name: DEF[i].name,
					description: DEF[i].description,
					parentProjectId: parent_id
				});

				Section.addSection(newSection, (err, return_section) => {
					let send__added_section;
					if (err) {
						no_errors = false;
						send__added_section = null;
					}
					else {
						send__added_section = return_section;
					}
					next(null, send__added_section);
				})

			},

			// Пушим в массив для ответа
			function (section) {
				return_array.push(section);
				__ENDING();
			}

		])

	},

		// Отдаем результат
		function () {
			if (no_errors) {
				res.json({
					success: true,
					msg: 'SECS Project ' + parent_id + ' initialized',
					data: return_array
				})
			}
			else {
				res.json({
					success: false,
					msg: 'SECS Project ' + parent_id + ' initialized with errors',
					data: return_array
				})
			}
		}

	);

});


// Delete Sections By Parent Id
router.delete('/delete/project/:id', PROTECT, (req, res, next) => {
	let project_id = req.params.id;

	Section.deleteSectionsByParent(project_id, (err, response) => {
		if (err) {
			throw err;
		}
		if (!response.result.n) {
			res.json({
				success: false,
				msg: 'SECS Sections not found'
			});
		}
		else {
			res.json({
				success: true,
				msg: 'SECS Sections of project ' + project_id + ' deleted'
			});
		}
	});
});


module.exports = router;