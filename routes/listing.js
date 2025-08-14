// ==============================
// 1. IMPORTS & CONFIGURATION
// ==============================
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");

// ---------------- CLOUD CONFIG COMMENTED ----------------
// const { storage } = require("../cloudConfig.js");
// const upload = multer({ storage });
// ---------------------------------------------------------

// If you still want to upload files locally without cloud:
// const upload = multer({ dest: 'uploads/' }); // optional

//Index Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    // upload.single("listing[image]"), // comment if not using cloud
    validateListing,
    wrapAsync(listingController.createListing)
  );

// 3. FORM TO CREATE NEW LISTING
router.get("/new", isLoggedIn, listingController.renderNewForm);

// 4. FILTER & SEARCH ROUTES
router.get("/filter/:id", wrapAsync(listingController.filter));
router.get("/search", listingController.search);

// 5. INDIVIDUAL LISTING ROUTES (SHOW, UPDATE, DELETE)
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    // upload.single("listing[image]"), // comment if not using cloud
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// 6. EDIT LISTING FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// 7. RESERVE A LISTING
router.get(
  "/:id/reservelisting",
  isLoggedIn,
  wrapAsync(listingController.reserveListing)
);

// 8. EXPORT ROUTER
module.exports = router;
