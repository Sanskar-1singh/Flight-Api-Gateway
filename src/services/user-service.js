const { StatusCodes } = require('http-status-codes');
const {UserRepository}=require('../repositories');
const AppError = require('../utils/errors/app-error');

const userRepository=new UserRepository();

async function create(data){
    try {
        const user=await userRepository.create(data);
        return user;
    } catch (error) {
        if(error.name=='SequelizeValidationError' || error.name=='SequelizeUniqueConstraintError'){
            let explanation=[];
            error.errors.forEach((err)=>{
                explanation.push(err.message);
            });
            console.log(error);
            console.log(explanation);
            throw new AppError(explanation,StatusCodes.INTERNAL_SERVER_ERROR);
        }
        throw new AppError('Cannot create a new user object',StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports={
    create
}