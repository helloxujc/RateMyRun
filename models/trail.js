const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const TrailSchema = new Schema({
    name: { type: String, required: true },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: { type: String, required: true },
    location: { type: String, required: true },

    distanceKm: { type: Number, min: 0 },
    elevationGain: { type: Number, min: 0 },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


TrailSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/trails/${this._id}">${this.name}</a></strong>
    <p>${(this.description || '').substring(0, 60)}${(this.description || '').length > 60 ? '…' : ''}</p>
  `;
});


TrailSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.reviews?.length) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model('Trail', TrailSchema);
