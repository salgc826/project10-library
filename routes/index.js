var express = require('express');
var router = express.Router();

var Patron = require('../models').Patron;
var Book = require('../models').Book;
var Loan = require('../models').Loan;

var Sequelize = require('sequelize');
const Op = Sequelize.Op



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});






module.exports = router;
