var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/', require('./api/index'));

module.exports = router;
