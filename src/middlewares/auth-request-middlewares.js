const {StatusCodes}=require('http-status-codes');

const {ErrorResponse}=require('../utils/common');
const AppError = require('../utils/errors/app-error');

function validateAuthRequest(req,res,next){
    if(!req.body.email){
        ErrorResponse.message='something went wrong while authenticating user';
        ErrorResponse.error=new AppError(['Email was not found in incoming request'],StatusCodes.BAD_REQUEST);

        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    if(!req.body.password){
        ErrorResponse.message='something went wrong while authenticating user';
        ErrorResponse.error=new AppError(['Password was not found in incoming request'],StatusCodes.BAD_REQUEST);

        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}
module.exports={
    validateAuthRequest
}