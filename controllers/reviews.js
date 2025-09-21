const Trail = require('../models/trail');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const trail = await Trail.findById(id);
  if (!trail) {
    req.flash('error', 'Cannot find that trail.');
    return res.redirect('/trails');
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  trail.reviews.push(review);
  await review.save();
  await trail.save();
  req.flash('success', 'New review created.');
  res.redirect(`/trails/${trail._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Trail.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review has been deleted.');
  res.redirect(`/trails/${id}`);
};