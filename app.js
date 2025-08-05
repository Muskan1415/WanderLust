const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Listing = require("./models/listings.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listings= require("./routes/listing.js");
const review= require("./routes/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const app = express();
// DB Connection
main()
  .then(() => console.log(" Connected to DB"))
  .catch((err) => console.log(" DB connection error:", err));

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



// =======================
//       Routes
// =======================

// New Listing Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
app.use("/listings", listings);
app.use("/listings/:id/reviews", review);

// Edit Listing Form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found for editing");
  res.render("listings/edit.ejs", { listing });
}));



/*
//  404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
*/
// Error Handling Middleware (corrected)
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// Server
app.listen(8080, () => {
  console.log(` Server running on port http://localhost:8080`);
});