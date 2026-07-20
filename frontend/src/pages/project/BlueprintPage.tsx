import {
  useState,
} from "react";





function BlueprintPage() {



  const [
    file,
    setFile,
  ] = useState<File | null>(null);



  const [
    preview,
    setPreview,
  ] = useState<string | null>(null);







  const handleUpload =
  (
    event:
    React.ChangeEvent<HTMLInputElement>
  ) => {


    const selectedFile =
      event.target.files?.[0];



    if(!selectedFile) {

      return;

    }





    const allowedTypes = [

      "image/png",

      "image/jpeg",

      "application/pdf",

    ];




    if(
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {


      alert(
        "Only PNG, JPG and PDF files are allowed"
      );


      return;

    }





    const maxSize =
      10 * 1024 * 1024;



    if(
      selectedFile.size > maxSize
    ) {


      alert(
        "File size must be less than 10MB"
      );


      return;

    }





    setFile(
      selectedFile
    );





    if(
      selectedFile.type.startsWith(
        "image"
      )
    ) {


      const imageUrl =
        URL.createObjectURL(
          selectedFile
        );


      setPreview(
        imageUrl
      );


    } else {


      setPreview(
        null
      );

    }



  };









  const removeFile =
  () => {


    setFile(
      null
    );


    setPreview(
      null
    );


  };









  return (


    <div>



      <h2>
        📐 Blueprint Management
      </h2>




      <p>
        Upload your construction blueprint
        to start planning and AI analysis.
      </p>








      <div

        style={{

          border:
          "2px dashed #999",

          padding:
          "40px",

          borderRadius:
          "12px",

          marginTop:
          "20px",

        }}

      >




        <input

          type="file"

          accept="
          image/png,
          image/jpeg,
          application/pdf
          "

          onChange={
            handleUpload
          }

        />





        {
          file && (

            <div>


              <hr />



              <h3>
                Selected Blueprint
              </h3>




              <p>

                File:
                {" "}
                {file.name}

              </p>




              <p>

                Size:
                {" "}
                {
                  (
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)
                }
                MB

              </p>






              {
                preview && (

                  <div>


                    <h4>
                      Preview
                    </h4>



                    <img

                      src={
                        preview
                      }

                      alt="Blueprint Preview"

                      style={{

                        width:
                        "500px",

                        maxWidth:
                        "100%",

                        border:
                        "1px solid #ccc",

                      }}

                    />



                  </div>

                )
              }






              {
                file.type ===
                "application/pdf" && (

                  <p>

                    📄 PDF blueprint selected.
                    Preview will be available
                    after backend upload.

                  </p>

                )
              }





              <button

                onClick={
                  removeFile
                }

                style={{

                  marginTop:
                  "15px",

                }}

              >

                Remove Blueprint

              </button>




            </div>

          )
        }





      </div>









      <hr />






      <h3>
        AI Processing Pipeline
      </h3>




      <ul>


        <li>
          ✅ Blueprint Selection
        </li>


        <li>
          🔒 Upload To Server
        </li>


        <li>
          🔒 Room Detection
        </li>


        <li>
          🔒 Wall Extraction
        </li>


        <li>
          🔒 3D Visualization
        </li>


      </ul>






    </div>


  );


}





export default BlueprintPage;