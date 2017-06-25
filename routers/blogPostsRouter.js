const express = require('express');

const bodyParser = require('body-parser');

// converts json from request into JavaScript for us to use
const jsonParser = bodyParser.json();

const router = express.Router();

const { BlogPost } = require('../models');

router.get('/', (req, res) => {
  BlogPost
    .find()
    .exec()
    .then((blogPosts) => {
      res.status(200).json({blogPosts: blogPosts.map((post) => post.apiRepr())});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
});



module.exports = router;