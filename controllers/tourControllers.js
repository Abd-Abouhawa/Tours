const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(404).json({
            status: 'fail',
            message: 'Missing name or price'
        });
    }
    next();
}

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = ('-ratingsAverage price');
    req.query.fields = ('name,price ratingsAverage summary difficulty');
    next();
}

exports.getAllTours = catchAsync(async(req, res, next) => {


    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;


    res.status(200).json({
        status: 'success',
        result: tours.length,
        requestedAt: req.requestTime,
        data: {
            tours
        }
    });
});


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);





exports.getTourStats = catchAsync(async(req, res, next) => {
    const stats = await Tour.aggregate([{
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // _id: {$toUpper : '$difficulty'},
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxRating: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: -1 }
        },
        {
            $match: { _id: { $ne: 'EASY' } }
        }

    ])

    res.status(200).json({
        status: 'success',
        result: stats.length,
        data: {
            data: stats
        }
    })

});

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([{
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfTours: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $project: { id: 0 }
        },
        {
            $sort: { numOfTours: -1 }
        }
    ])

    res.status(200).json({
        status: 'success',
        result: plan.length,
        data: plan
    })
});









// exports.getTour = catchAsync(async(req, res, next) => {

//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     //const tour = await Tour.findById(req.params.id).populate('guides')

//     if (!tour) {
//         return next(new AppError('No tour found with that ID!', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         data: {
//             tour
//         }
//     });
// });


// exports.createTour = catchAsync(async(req, res, next) => {

//     const tour = await Tour.create(req.body);
//     /*
//         const newTour = new Tour(req.body);
//         newTour.save().then(doc =>{ ...... })
//     */

//     res.status(201).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         data: {
//             tour
//         }
//     });
// });