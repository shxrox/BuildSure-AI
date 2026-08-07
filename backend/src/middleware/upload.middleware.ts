import multer from "multer";





const storage =
multer.memoryStorage();







const fileFilter =
(
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {




    const allowedTypes = [

        "application/json",

        "image/svg+xml",

        "application/dxf"

    ];






    const allowedExtensions = [

        ".json",

        ".svg",

        ".dxf"

    ];







    const fileExtension =
        file.originalname
        .toLowerCase()
        .substring(
            file.originalname.lastIndexOf(".")
        );







    if (

        allowedTypes.includes(
            file.mimetype
        )

        ||

        allowedExtensions.includes(
            fileExtension
        )

    ) {


        cb(null, true);


    }

    else {


        cb(

            new Error(
                "Only SVG, JSON and DXF blueprint files are allowed"
            )

        );


    }


};









const upload =
multer({


    storage,


    fileFilter,



    limits:{


        fileSize:
            20 * 1024 * 1024


    }


});








export default upload;