const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  created: {type: String, required: true},
  tags: [String]
});

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    // created: this.created,
    tags: this.tags
  }
}

// building BlogPost model specifying the collection name we are mapping to and the schema it will follow
const BlogPost = mongoose.model('Blogpost', blogPostSchema);

module.exports = { BlogPost };
