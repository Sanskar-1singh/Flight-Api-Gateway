const { StatusCodes } = require('http-status-codes');
const {UserRepository}=require('../repositories');
const AppError = require('../utils/errors/app-error');

const {Auth}=require('../utils/common');

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
async function signin(data){
     try {
        const user=await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new AppError('cannot find user with the given email',StatusCodes.BAD_REQUEST);
        }

        const passwordMatch=Auth.checkPassword(data.password,user.password);
        console.log(passwordMatch);
        if(!passwordMatch){
            throw new AppError('Invalid passsword',StatusCodes.BAD_REQUEST);
        }
        const jwt=Auth.createToken({id:user.id,email:user.email});
        return jwt;
     } catch (error) {
          console.log(error);
          if(error instanceof AppError) throw error;
          throw new AppError('Something went wrong',StatusCodes.INTERNAL_SERVER_ERROR);
     }
}


module.exports={
    create,
    signin
}