const express = require('express');

const bodyParser = require('body-parser');

// converts json from request into JavaScript for us to use
// const jsonParser = bodyParser.json();

const router = express.Router();

const { BlogPost } = require('../models');

router.get('/', (req, res) => {
  BlogPost
    .find()
    // .limit(5)
    .exec()
    .then((blogPosts) => {
      res.status(200).json({blogPosts: blogPosts.map((post) => post.apiRepr())});
    })
    .catch((err) => {
      console.error('error:', err);
      res.status(500).json({message: 'There was an error retrieving all blog posts'});
    });
});

router.get('/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then((post) => {
      res.status(200).json({blogPost: post.apiRepr()});
    })
    .catch((err) => {
      console.error('error:', err);
      res.status(500).json({message: 'There was an error retrieving the requested blog post'});
    })
});

function findMissingAuthorField(requiredAuthorFields, reqBody) {
  return requiredAuthorFields.filter((field) => {
    return !(field in reqBody.author);
  });  
}

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  const requiredAuthorFields = ['firstName', 'lastName'];

  const missingFields = requiredFields.filter((field) => {
    return !(field in req.body);
  });

  // if author prop exists check for required author fields
  if (req.body.author) {
    const missingAuthorFields = findMissingAuthorField(requiredAuthorFields, req.body);
    missingFields.push(...missingAuthorFields);
  }

  if (missingFields.length) {
    const message = `Missing ${missingFields} in request body for your POST request`;
    res.status(400).json({message: message});
  }

  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: {
        firstName: req.body.author.firstName,
        lastName: req.body.author.lastName
      },
      created: new Date().getTime(),
      tags: req.body.tags
    })
    .then((blogPost) => {
      res.status(201).json(blogPost.apiRepr());
    })
    .catch((err) => {
      console.error('error:', err);
      res.status(500).json({message: `There was an error creating your blog post`});
    });

});

router.put('/:id', (req, res) => {

  // check that route param id and request body id match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Route parameter id ${req.params.id} and request body id ${req.body.id} must match`;
    console.error('error:', message);
    res.status(400).json({message: message});
  }

  // build upate object passed to findByIdAndUpdate
  const updatableFields = [
    {fieldName: 'title', type: 'string'},
    {fieldName: 'content', type: 'string'},
    {fieldName: 'author', type: 'object'},
    {fieldName: 'tags', type: 'object'}
    ];
  let toUpdate = {};

  // TODO: ADD VALIDATION ON FIELD TYPES IN REQ.BODY BEFORE ADDING TO TOUPDATE
  updatableFields.forEach((field) => {
    if (field.fieldName in req.body) {
      toUpdate[field.fieldName] = req.body[field.fieldName];
    }
  });

  BlogPost
    // new: true, specifies updated item will be returned
    .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
    .exec()
    .then((post) => {
      res.status(200).json(post.apiRepr());
    })
    .catch((err) => {
      console.error('error: ', err);
      res.status(500).json({message: `There was an error updating post with id of ${req.params.id}`});
    });
});

router.delete('/', (req, res) => {
  
});

module.exports = router;