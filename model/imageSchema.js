
  const mongo=require('mongoose');

  const imageSchema = new mongo.Schema(
      {
        name: String,
        photo: String,
        userId:String
      }
  );

  imageSchema.methods.update = async function (data){
    const {name,photo} = data;
    try{
        this.name = name;
        this.photo = photo;
        this.dob = dob;
        this.firstName = firstName;
        this.lastName= lastName;
        this.photo = photo;
        await this.save();
    }catch(err){
        console.log("Error Occured");
    }
}
  
  
  
  const Image = mongo.model('Image', imageSchema);
  module.exports = Image;