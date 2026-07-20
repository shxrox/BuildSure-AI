import dotenv from "dotenv";

dotenv.config();


import cloudinary from "./config/cloudinary";


const testUpload = async () => {

  try {


    const result =
      await cloudinary.uploader.upload(

        "https://res.cloudinary.com/demo/image/upload/sample.jpg",

        {
          folder:
            "buildsure/test",
        }

      );



    console.log(
      "UPLOAD SUCCESS"
    );


    console.log(
      result.secure_url
    );



  } catch(error:any) {


    console.log(
      "UPLOAD FAILED"
    );


    console.dir(
      error,
      {
        depth:null,
      }
    );


  }

};



testUpload();