const Posting = require('../models/postingModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  search() {
    const { keyword } = this.queryString;
    if (keyword) {
      const currentModel = this.query.mongooseCollection.name;
      let acceptedProps;
      if (currentModel === 'postings') {
        acceptedProps = ['title', 'content'];
      } else if (currentModel === 'comments') {
        acceptedProps = ['comment'];
      } else if (currentModel === 'users') {
        acceptedProps = ['name'];
      }

      const toFind = acceptedProps.reduce((prev, curr) => {
        prev.push({ [curr]: { $regex: keyword } });
        return prev;
      }, []);
      this.query = this.query.find({
        $or: toFind,
      });
    }
    return this;
  }
  filter() {
    let { page, sort, limit, fields, keyword, ...queryStr } = this.queryString;
    queryStr = JSON.stringify(queryStr);
    // \b to find all the right word, /g to find all matched, not the only one
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (el) => `$${el}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    let { sort } = this.queryString;
    if (sort) {
      this.query = this.query.sort(sort);
    } else {
      this.query = this.query.sort('-date');
    }
    return this;
  }
  paginate() {
    let { page, limit } = this.queryString;
    const newPage = page * 1 || 1;
    const newLimit = limit * 1 || 20;
    const skip = (newPage - 1) * newLimit;
    this.query = this.query.skip(skip).limit(newLimit);
    return this;
  }
  limit() {
    let { fields } = this.queryString;
    if (fields) {
      const newLimitFields = fields.split(',').join(' ');
      this.query = this.query.select(newLimitFields);
    }
    return this;
  }
}
module.exports = APIFeatures;
