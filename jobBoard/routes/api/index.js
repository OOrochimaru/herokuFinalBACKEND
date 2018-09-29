var router = require('express')();

router.use('/index', require('./users'));

module.exports = router;