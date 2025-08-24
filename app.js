if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listings.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const app = express();

// =======================
//   DB Connection
// =======================
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌ DB connection error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// =======================
//   View engine & static
// =======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// =======================
//   Session & Flash
// =======================
const sessionOptions = {
  secret: "mysecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// =======================
//   Passport Config
// =======================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
//   Flash Middleware
// =======================
app.use((req, res, next) => {
  // Sirf ek message allow karenge
  const success = req.flash("success");
  const error = req.flash("error");

  res.locals.success = success.length > 0 ? success[0] : null;
  res.locals.error = error.length > 0 ? error[0] : null;
  res.locals.currUser = req.user;
  next();
});


// =======================
//   Routes
// =======================

// Test route for creating demo user
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Edit route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found for editing");
    res.render("listings/edit.ejs", { listing });
  })
);

// =======================
//   Error Handler
// =======================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// =======================
//   Server
// =======================
app.listen(8080, () => {
  console.log(`🚀 Server running on http://localhost:8080`);
});
