const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/new', controller.new);

router.post('/', controller.create);

router.get('/login', controller.getUserLogin);

router.post('/login', controller.login);

router.get('/profile', controller.profile);

router.get('/logout', controller.logout);

module.exports = router;