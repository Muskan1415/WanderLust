const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController= require("../controllers/users.js")

// ----------------- SIGNUP -----------------
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post(
    "/signup",
    wrapAsync(async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            const newUser = new User({ username, email });
            const registeredUser = await User.register(newUser, password);

            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to Wanderlust!");
                const redirectUrl = req.session.redirectUrl || "/listings";
                delete req.session.redirectUrl; // remove after use
                res.redirect(redirectUrl);
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    })
);

// ----------------- LOGIN -----------------
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: "Invalid username or password",
    }),
    (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

// ----------------- LOGOUT -----------------
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;
