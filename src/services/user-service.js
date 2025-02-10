const { StatusCodes } = require('http-status-codes');
const {UserRepository,RoleRepository}=require('../repositories');
const AppError = require('../utils/errors/app-error');

const {Auth}=require('../utils/common');

const userRepository=new UserRepository();
const roleRepository=new RoleRepository();

async function create(data){
    try {
        const user=await userRepository.create(data);
        const role=await roleRepository.getRoleByName('customer');
        console.log('hello>>>>>',role);
        user.addRole(role);//NOT UNDERSTOOD THIS PART BECAUSE OF WEAK KNOWLEDGE IN ASSOCIATION>>>
                           //as i signup it will bydefault add customer role for corresponding user in user_roles table>>
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

  async function addRoletoUser(data){
    try {
        const user=await userRepository.get(data.id);
        if(!user){
            throw new AppError('No user found for the given id',StatusCodes.BAD_REQUEST);
        }
        const role=await roleRepository.getRoleByName(data.role);
        if(!role){
            throw new AppError('No role was found for given role',StatusCodes.BAD_REQUEST);
        }
        await user.addRole(role);
        console.log(user);
        return user;
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong',StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

/**  all the below mention statment belong to isAdmin(id) function>>>>>
 * first user will siginin causes  this is auth protected api and then it will check even signedin user is admin
 * or not if not then it will directly throw error and of it is admin then it will mark the given id and role to that
 * user and make brand new entry in user_roles table because a user can be purse more than one thing at a time
 * such as it can be admin as well as customer and even also flight_company
 *  
 * but i have to manually set particular user to admin to DB because as i signup by default it set
 * user to customer>>>
 *  
 */
  async function isAdmin(id){
     try {
        const user=await userRepository.get(id);
        if(!user){
            throw new AppError('No user was found for the given id',StatusCodes.BAD_REQUEST);
        }
        const adminrole=await roleRepository.getRoleByName('admin');
        if(!adminrole){
            throw new AppError('No user was found for the given role',StatusCodes.NOT_FOUND);
        }
        return user.hasRole(adminrole);
     }
     catch(error){
          if(error instanceof AppError) throw error;

          console.log(error);
          throw new AppError('Something went wrong',StatusCodes.INTERNAL_SERVER_ERROR);
     }
  }
module.exports={
    create,
    signin,
    isAuthenticated,
    addRoletoUser,
    isAdmin
}