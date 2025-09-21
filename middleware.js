
const { trailSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Trail = require('./models/trail');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please sign in first.');
    return res.redirect('/login');
  }
  next();
};

module.exports.validateTrail = (req, res, next) => {
  const { error } = trailSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const trail = await Trail.findById(id);
  if (!trail) {
    req.flash('error', 'Trail not found.');
    return res.redirect('/trails');
  }
  if (!trail.author.equals(req.user._id)) {
    req.flash('error', 'Sorry, no permission.');
    return res.redirect(`/trails/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Review not found.');
    return res.redirect(`/trails/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Sorry, no permission.');
    return res.redirect(`/trails/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  next();
};