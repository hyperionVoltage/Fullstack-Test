const express = require("express")
const bcrypt = require("bcryptjs")
const passport = require("passport")

const router = express.Router()

// Models
const User = require("../models/User")
const Note = require("../models/Note")

// Login Page
router.get("/login", (req, res) => {
    res.render("login")
})

// Register Page
router.get("/register", (req, res) => {
    res.render("register")
})

// Register Handle
router.post("/register", (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body
    let errors = []

    // Check Required fields
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: "Please fill in all fields"
        })
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({
            msg: "Passwords do not match"
        })
    }

    // Password length
    if (password.length < 6) {
        errors.push({
            msg: "Password should be at least 6 characters"
        })
    }

    if (errors.length > 0) {
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // Validation passed
        User.findOne({
            email: email
        }).then((user) => {
            if (user) {
                // User Exists
                errors.push({
                    msg: "Email already exists"
                })
                res.render("register", {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                })

                // Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        // Set password to hashed
                        newUser.password = hash
                        // Save user
                        newUser.save().then((user) => {
                            req.flash("success_msg", "You are now registed, Please log in!")
                            res.redirect("/users/login")
                        }).catch(err => console.log(err))
                    })
                })
            }
        })
    }
})

// Login Handle
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

// Logout Handle
router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "You have been logged out")
    res.redirect("/users/login")
})

// Add Note Handle
router.post("/addnote", (req, res) => {
    const {
        note
    } = req.body
    const {
        email
    } = req.user

    if (note) {
        newNote = new Note({
            note,
            useremail: email
        })

        newNote.save().then((note) => res.redirect("/dashboard")).catch(err => console.log(err))
    } else {
        res.redirect("/dashboard")
        return
    }
})

// Delete Note Handle
router.get("/deletenote", (req, res) => {
    const noteId = req.query.noteId
    Note.findById(noteId, (err, note) => {
        if (err) {
            console.log(err)
        }
        if (note.useremail === req.user.email) {
            note.remove((err, freshnote) => {
                if (err) {
                    console.log(err)
                }
                console.log("Deleted Note: " + freshnote.note)
                res.redirect("/dashboard")
                return
            })
        } else {
            res.redirect("/dashboard")
            return
        }
    })
})

module.exports = router