import cloudinary from "cloudinary";


cloudinary.v2.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

});


console.log(
  "CLOUDINARY CONFIG LOADED",
  {
    cloud:
      process.env.CLOUDINARY_CLOUD_NAME,

    key:
      process.env.CLOUDINARY_API_KEY
        ? "FOUND"
        : "MISSING",

    secret:
      process.env.CLOUDINARY_API_SECRET
        ? "FOUND"
        : "MISSING",
  }
);


export default cloudinary.v2;