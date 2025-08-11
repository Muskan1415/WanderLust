const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listings");
//const { validateReview } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema.js")
const Review= require("../models/review.js")


const validateReview=(req,res,next)=>{
   let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg= error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error.message); // better error string
    
  }else{
    next();
  }

}

// POST Review
router.post("/", validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// DELETE Review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review and Deleted!");
  res.redirect(`/listings/${id}`);
}));


module.exports = router;
