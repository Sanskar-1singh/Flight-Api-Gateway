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

  async function isAuthenticated(token){
       try {
         if(!token){
            throw new AppError('Missing JWT token',StatusCodes.BAD_REQUEST);
         }
         const response=Auth.verifyToken(token);

         const user=await userRepository.get(response.id);
         if(!user){//because sequelize return null if no user is found>>
            throw new AppError('No user found',StatusCodes.BAD_REQUEST);
         }
         return user.id;
       } catch (error) {
        //error is object and we are checking whether it is object of AppError class>>
        //always remember any error thrown from anywhere will always get catch in CATCH block>>
        if(error instanceof AppError) throw error; //because the error try block throw such as  throw new AppError('No user found',StatusCodes.BAD_REQUEST);
                                                  //will get catch in catch block and then if it is instance of app error then we will throw that error as it is 
                                                //instead of treating as other error>>>
           if(error.name=='JsonWebTokenError'){
            throw new AppError('Invalid JWT token',StatusCodes.BAD_REQUEST);
           }

           if(error.name=='TokenExpiredError'){
             throw new AppError('JWT token expired',StatusCodes.BAD_REQUEST);
           }
           console.log(error);
           throw error;
       }
  }
module.exports={
    create,
    signin,
    isAuthenticated
}