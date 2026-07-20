import {
  useState,
} from "react";





function BlueprintPage() {



  const [
    file,
    setFile,
  ] = useState<File | null>(null);






  const handleUpload =
  (
    event:
    React.ChangeEvent<HTMLInputElement>
  ) => {


    const selectedFile =
      event.target.files?.[0];



    if(selectedFile) {


      setFile(
        selectedFile
      );


    }


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

          border:"2px dashed #aaa",

          padding:"40px",

          borderRadius:"12px",

          marginTop:"20px",

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


              <h3>
                Uploaded File
              </h3>



              <p>
                {file.name}
              </p>



              <p>
                Size:
                {" "}
                {
                  (
                    file.size /
                    1024
                  ).toFixed(2)
                }
                KB
              </p>



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
          ⏳ Blueprint Upload
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