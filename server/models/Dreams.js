const mongoose = require('mongoose');

const dreamSchema = mongoose.Schema({
    userId :{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dreamtext : { type: String },
    paragraph: { type: Object },
    emotion: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dream', dreamSchema);