const mongoose = require('mongoose');
const slugify = require('slugify');

const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'a name must have less or equal 40 characters!'],
        minLength: [10, 'a name must have more or equal 10 characters!']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: String,
        reuqire: [true, 'A tour must have a difficulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either : easy , medium or : difficult!'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        required: [true, 'A tour must have a description'],
        trim: true
    },
    decription: {
        type: String,
        trim: true
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            }
        },
        message: 'Discount price ({value}) should be < pirce!'
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String], // array of strings 
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'point',
            enun: ['point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'point',
            enum: ['point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number

    }],
    // guides: Array
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// INDEXING
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})


tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`query took ${Date.now() - this.start} millisecond!`);
    next();
})


tourSchema.pre('aggregate', function(next) {
    console.log(this.pipeline());
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;