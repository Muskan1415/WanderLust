const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Listing = require("./models/listings.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js")
const Review= require("./models/review.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const app = express();
// DB Connection
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌ DB connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// App Config
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing=(req,res,next)=>{
   let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg= error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error.message); // better error string
    
  }else{
    next();
  }
};
const validateReview=(req,res,next)=>{
   let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg= error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error.message); // better error string
    
  }else{
    next();
  }

}

// =======================
//       Routes
// =======================

// New Listing Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Edit Listing Form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found for editing");
  res.render("listings/edit.ejs", { listing });
}));

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/show.ejs", { listing });
}));

// Create Listing
app.post("/listings",validateListing, wrapAsync(async (req, res) => {
 
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// Update Listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!updatedListing) throw new ExpressError(404, "Listing not found for update");
  res.redirect(`/listings/${id}`);
}));

// Delete Listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) throw new ExpressError(404, "Listing not found for deletion");
  res.redirect("/listings");
}));
//Reviews ---Post Route
/*app.post("listings/:id/review",async(req,res)=>{
 let listing= await Listing.findById(req.params.id);
 let newReview= new Review(req.body.review);

 listing.reviews.push(newReview);

 await newReview.save();
 await listing.save();

 console.log("new review saved");
 res.send("new review saved");
})*/
app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  console.log("new review saved");
//res.send("new review saved");
  res.redirect(`/listings/${listing._id}`);
}));

/*
// ✅ 404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
*/
// ✅ Error Handling Middleware (corrected)
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// Server
app.listen(8080, () => {
  console.log(`🚀 Server running on port http://localhost:8080`);
});
