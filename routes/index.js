const express = require("express")
const bcrypt = require("bcryptjs")

const router = express.Router()
const {
    ensureAuthenticated
} = require("../config/auth")

// Models
const User = require("../models/User")
const Note = require("../models/Note")

router.get("/", (req, res) => {
    res.render("welcome")
})

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    Note.find({
        useremail: req.user.email
    }).then((notes) => {
        //console.log(notes)
        res.render("dashboard", {
            name: req.user.name,
            notes
        })
    }).catch((err) => {
        console.log(err)
    })
})

module.exports = router