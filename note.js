exports.createTour = async(req, res) => {
    try {
        const tour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

// The goal here is handle the errors in async function and get rid of try/catch blocks

/**
 * 1- First we are going to create catchAsync function that accept async function as parameter
 * 2- call in it this function and give it 3parameter (req,res,next)
 * req,res : by default that are exist in the async function (createTour)
 * next  : for pass it in catch as a error in order to execute the global handler middleware
 * 3- after we call this function we put catch ?? because async function will return a promise(remember)
 * 4- add next parameter to createTour function
 * 5- put createTour function as a parameter in catchAsync function
 */

const catchAsync = fn => {
    fn(req, res, next).catch(next(err));
}


exports.createTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tour
        }
    });
});

// But for now this don't work because createTour is a function and after execute it
// will be execute async function that we put inside catchAsync => not consider as a function(createTour)
// The solve is make catchAsync function return function to store it into createTour variable    

const catchAsync2 = fn => {
        return (req, res, next) => {
            fn(req, res, next).catch(next);
        }
    }
    // Note : we write in catch just next not next(err) , because
    // in JS by default when we pass just a parameter in catch , consider it a function 
    // and pass to it the err that happen as a parameter => catch(next(err)) = catch(next)






// Finally , create catchAsync.js in utils and put in it catchAsync function


module.export = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

// and require it in tourController as a catchAsync = require(.....)


// another note 

// we can put like this instead of put the implementation of async function in catchAsync as parameter

/*
.route('/')
.get(catchAsync(tourController.getAllTours))
*/