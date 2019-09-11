const mongoose = require("mongoose")

const NoteSchema = new mongoose.Schema({
    note: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        required: false
    },
    useremail: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
})

const Note = mongoose.model("Note", NoteSchema)

module.exports = Note