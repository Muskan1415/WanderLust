const Listing = require("../models/listings"); 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

// ------------------ All listings ------------------
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings }); // ./ hata diya
  } catch (err) {
    console.error("Error fetching listings:", err);
    req.flash("error", "Cannot load listings at the moment!");
    res.redirect("/");
  }
};

// ------------------ Render new listing form ------------------
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// ------------------ Show single listing ------------------
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// ------------------ Create listing ------------------
module.exports.createListing = async (req, res) => {
  const geoResponse = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }

  if (geoResponse.body.features.length) {
    newListing.geometry = geoResponse.body.features[0].geometry;
  } else {
    newListing.geometry = { type: "Point", coordinates: [0, 0] };
  }

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// ------------------ Render edit form ------------------
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you are trying to edit does not exist!");
    return res.redirect("/listings");
  }

  let imageUrl = listing.image?.url || listing.image || "";
  if (imageUrl && imageUrl.includes("/upload")) {
    imageUrl = imageUrl.replace("/upload", "/upload/w_250,h_160");
  }

  res.render("listings/edit", { listing, imageUrl });
};

// ------------------ Update listing ------------------
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const geoResponse = await geoCodingClient
    .forwardGeocode({
      query: `${req.body.listing.location},${req.body.listing.country}`,
      limit: 1,
    })
    .send();

  const updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (geoResponse.body.features.length) {
    updatedListing.geometry = geoResponse.body.features[0].geometry;
  } else {
    updatedListing.geometry = { type: "Point", coordinates: [0, 0] };
  }

  if (req.file) {
    updatedListing.image = { url: req.file.path, filename: req.file.filename };
  }

  await updatedListing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// ------------------ Filter by category ------------------
module.exports.filter = async (req, res) => {
  const { id } = req.params;
  const allListings = await Listing.find({ category: { $all: [id] } });

  if (allListings.length) {
    res.locals.success = `Listings filtered by ${id}!`;
    return res.render("listings/index", { allListings });
  }

  req.flash("error", `No listings found for ${id}!`);
  res.redirect("/listings");
};

// ------------------ Search listings ------------------
module.exports.search = async (req, res) => {
  let input = req.query.q?.trim().replace(/\s+/g, " ") || "";

  if (!input) {
    req.flash("error", "Please enter a search query!");
    return res.redirect("/listings");
  }

  input = input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const searchFields = ["title", "category", "country", "location"];

  for (let field of searchFields) {
    const allListings = await Listing.find({
      [field]: { $regex: input, $options: "i" },
    }).sort({ _id: -1 });

    if (allListings.length) {
      res.locals.success = `Listings searched by ${field}!`;
      return res.render("listings/index", { allListings });
    }
  }

  const intValue = parseInt(input, 10);
  if (!isNaN(intValue)) {
    const allListings = await Listing.find({ price: { $lte: intValue } }).sort({
      price: 1,
    });
    if (allListings.length) {
      res.locals.success = `Listings with price less than ₹${input}!`;
      return res.render("listings/index", { allListings });
    }
  }

  req.flash("error", "No listings found based on your search!");
  res.redirect("/listings");
};

// ------------------ Delete listing ------------------
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

// ------------------ Reserve listing ------------------
module.exports.reserveListing = async (req, res) => {
  const { id } = req.params;
  req.flash("success", "Reservation details sent to your email!");
  res.redirect(`/listings/${id}`);
};
