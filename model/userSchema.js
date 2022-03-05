const jwt = require('jsonwebtoken');
const mongo=require('mongoose');
const bcrypt= require('bcryptjs');
const secret= 'ASDFGHJKJHGFDFGHJKHDFGHKJLHTFYHGYGGCFYGHVGKHGHVGFTGHBVHGJVGYHGJY';

const userSchema = new mongo.Schema(
    {
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        gender:{
            type:String,
            required:true
        },
        photo:{
            type:String
        },
        dob:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:false
        }
    }
);

//hasing the password
userSchema.pre('save',async function(next){
      if(this.isModified('password')){
          this.password = await bcrypt.hash(this.password,12);
          console.log(this.password);
      }
      next();
})

userSchema.methods.generateAuthToken = async function (){
    try{
        let token = jwt.sign({_id:this._id},secret);
        this.token = token;
        await this.save();
        return token;
    }catch(err){
        console.log("Error Occured");
    }
}

userSchema.methods.update = async function (data){
    const {email,gender,firstName,lastName,dob,photo} = data;
    try{
        this.email = email;
        this.gender = gender;
        this.dob = dob;
        this.firstName = firstName;
        this.lastName= lastName;
        this.photo = photo;
        await this.save();
    }catch(err){
        console.log("Error Occured");
    }
}

userSchema.methods.uploadPhoto = async function (data){
    const {photo} = data;
    try{
        this.photo = photo;
        await this.save();
    }catch(err){
        console.log("Error Occured");
    }
}

const User = mongo.model('User', userSchema);
module.exports = User;