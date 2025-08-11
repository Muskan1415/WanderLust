const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listings.js");

// Validation Middleware
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New Listing Form (optional if needed)
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Edit Listing Form (put before show route)
router.get("/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found for editing");
  res.render("listings/edit.ejs", { listing });
}));

// Show Route
/*router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show.ejs", { listing });
}));*/
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

// Create Listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}));

// Update Listing
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!updatedListing) throw new ExpressError(404, "Listing not found for update");
  res.redirect(`/listings/${id}`);
}));

// Delete Listing
router.delete("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) throw new ExpressError(404, "Listing not found for deletion");
  res.redirect("/listings");
}));

module.exports = router;
