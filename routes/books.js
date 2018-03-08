var express = require("express");
var router = express.Router();
const moment = require("moment");
var Patron = require("../models").Patron;
var Book = require("../models").Book;
var Loan = require("../models").Loan;

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

let todaysDate = moment().format("YYYY-MM-DD");
let returnDate = moment(todaysDate)
  .add(7, "days")
  .format("YYYY-MM-DD");

/**************route for all books************************************************************ALL */
router.get("/", function(req, res, next) {
  Book.findAll({
    order: [["title", "ASC"]]
  })
    .then(function(books) {
      res.render("books", {
        books
      });
    })
    .catch(function(error) {
      res.send(500);
    });
});

/*******************route to get checked out books**************************************CHECKED */

router.get("/checked_books", function(req, res, next) {
  Book.findAll({
    include: [
      {
        all: true,

        where: {
          loaned_on: {
            [Op.ne]: null
          },
          returned_on: {
            [Op.eq]: null
          }
        }
      }
    ]
  })
    .then(function(checked) {
      res.render("books_checked", {
        checked
      });
    })
    .catch(function(error) {
      res.send(500, error);
    });
});

/************************route for overdue books******************************************OVERDUE */
router.get("/overdue_books", function(req, res, next) {
  Loan.findAll({
    where: {
      return_by: {
        [Op.lt]: new Date()
      },
      returned_on: {
        [Op.eq]: null
      }
    },
    include: [{ model: Book }, { model: Patron }]
  })
    .then(function(results) {
      res.render("books_overdue", {
        overdue: results
      });
    })
    .catch(function(error) {
      res.send(500, error);
    });
});

/*******************route to get new book entry form*****************************NEW */
router.get("/new_book", function(req, res, next) {
  res.render("book_new");
});

/*****************Post a new book*****will validate and notify of errors********* POST NEW */

router.post("/new_book", function(req, res, next) {
  Book.create(req.body)
    .then(function(book) {
      res.redirect("/books");
    })
    .catch(function(error) {
      if (error.name === "SequelizeValidationError") {
        res.render("book_new", {
          errors: error.errors,
          title: req.body.title,
          genre: req.body.genre,
          author: req.body.author,
          first_published: req.body.first_published
        });
      } else {
        throw error;
      }
    })
    .catch(function(error) {
      res.send(500);
    });
});
/***********************route for Book details and edit form********************************** DETAIL*/

router.get("/edit/:id", function(req, res, next) {
  let errors = [req.query.errors];
  const foundBook = Book.findById(req.params.id);
  const foundLoan = Loan.findAll({
    where: [
      {
        book_id: req.params.id
      }
    ],
    include: [{ model: Patron }, { model: Book }]
  });

  Promise.all([foundBook, foundLoan])
    .then(function(values) {
      if (values) {
        res.render("book_details", {
          book: values[0],
          loans: values[1],
          errors: errors
        });
      } else {
        res.send(404);
      }
    })
    .catch(function(error) {
      res.send(500);
    });
});

/**********************Post the updates from the form**********************************UPDATE */
router.post("/edit/:id", function(req, res, next) {
  Book.update(req.body, {
    where: [
      {
        id: req.params.id
      }
    ]
  })
    .then(function() {
      return res.redirect("/books");
    })
    .catch(errors => {
      const errorMessages = errors.errors.map(err => err.message);
      return res.redirect(
        `/books/edit/${req.params.id}?errors=${errorMessages}`
      );
    });
});
/**********************route for the return book form************************RETURN BOOK LOAN */

router.get("/return/:id", function(req, res, next) {
  Loan.findAll({
    where: [
      {
        book_id: req.params.id
      }
    ],
    include: [{ model: Patron }, { model: Book }]
  })
    .then(function(loans) {
      if (loans) {
        res.render("book_return", {
          loan: loans[0],
          patron: loans[1],
          book: loans[2],
          todaysDate
        });
      } else {
        res.send(404);
      }
    })
    .catch(function(error) {
      res.send('500');
    });
});


/**************Post the return book form Update db ****************POST UPDATE RETURN BOOK*/

router.post("/return/:id", function(req, res, next) {
  Loan.update(req.body, {
    where: [
      {
        book_id: req.params.id
      }
    ]
  })
    .then(function() {
      return res.redirect("/loans");
    })

    .catch(function(error) {
      if(error.name === 'SequelizeValidationError'){



        Loan.findAll({
          where: [
            {
              book_id: req.params.id
            }
          ],
          include: [{ model: Patron }, { model: Book }]
        })
          .then(function(loans) {
            if (loans) {
              res.render("book_return", {
                errors: error.errors,
                loan: loans[0],
                patron: loans[1],
                book: loans[2],
                todaysDate
              });
            } else {
              res.send(404);
            }
          })








      }else {
          res.send(500, error);
        }
    });
});

module.exports = router;
