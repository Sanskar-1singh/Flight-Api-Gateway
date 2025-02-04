const {StatusCodes}=require('http-status-codes');

const {SuccessResponse,ErrorResponse}=require('../utils/common/index');
const {UserService}=require('../services');

async function signup(req,res){
    try {
        const user=await UserService.create({
            email:req.body.email,
            password:req.body.password
        });
        SuccessResponse.data=user;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error=error;
        return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}

async function signin(req,res){
    try {
        const user=await UserService.signin({
            email:req.body.email,
            password:req.body.password
        });
        SuccessResponse.data=user;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error=error;
        return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}
module.exports={
    signup,
    signin
}