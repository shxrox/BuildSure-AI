import {
  useState,
} from "react";


import {
  useParams,
} from "react-router-dom";


import {
  uploadBlueprint,
} from "../../services/project.service";



function BlueprintPage() {


  const {
    id,
  } = useParams();



  const [
    file,
    setFile
  ] = useState<File | null>(null);



  const [
    uploading,
    setUploading
  ] = useState(false);



  const [
    blueprint,
    setBlueprint
  ] = useState<any>(null);



  const [
    mode,
    setMode
  ] = useState<
    "upload" | "editor"
  >(
    "upload"
  );





  const handleFileChange =
  (
    e:
    React.ChangeEvent<HTMLInputElement>
  ) => {


    const selected =
      e.target.files?.[0];


    if(selected){

      setFile(selected);

    }


  };







  const handleUpload =
  async()=>{


    if(!id || !file)
      return;



    try{


      setUploading(true);



      const response =
      await uploadBlueprint(
        id,
        file
      );



      setBlueprint(
        response
      );



      // after upload open editor

      setMode(
        "editor"
      );



    }
    catch(error){


      console.error(
        "UPLOAD ERROR",
        error
      );


    }
    finally{


      setUploading(false);


    }


  };







  return (

<div
style={{
padding:"30px"
}}
>


<h1>
📐 Blueprint Workspace
</h1>


<p>
Upload your construction drawing and
convert it into an editable digital plan.
</p>



{
mode==="upload" && (

<div
style={{
border:"2px dashed #999",
padding:"40px",
borderRadius:"15px"
}}
>


<h2>
Step 1: Upload Blueprint
</h2>



<input

type="file"

accept="
image/png,
image/jpeg,
application/pdf
"

onChange={
handleFileChange
}

/>



{
file && (

<div>

<h3>
Selected File
</h3>


<p>
{file.name}
</p>


<p>
{
(file.size/1024)
.toFixed(2)
}
KB
</p>


</div>

)

}





<button

disabled={
!file ||
uploading
}

onClick={
handleUpload
}

style={{
marginTop:"20px",
padding:"12px 25px"
}}

>

{

uploading

?

"Uploading..."

:

"Upload Blueprint"

}

</button>



</div>

)

}







{
mode==="editor" && (


<div>


<h2>
Step 2: Blueprint Editor
</h2>



<div

style={{

height:"500px",

border:
"1px solid #ccc",

borderRadius:"15px",

display:"flex",

alignItems:"center",

justifyContent:"center"

}}

>


<h3>

🖊 Canvas Editor Coming Next

</h3>


</div>





<div

style={{
marginTop:"20px"
}}

>


<button>

➕ Add Wall

</button>


<button>

🚪 Add Door

</button>


<button>

🪟 Add Window

</button>


<button>

📏 Add Dimension

</button>


</div>



</div>


)

}







<hr/>





<h2>
AI Processing Pipeline
</h2>


<ul>

<li>
✅ Blueprint Upload
</li>


<li>
🔄 Convert Drawing To Digital Plan
</li>


<li>
🔒 Room Detection
</li>


<li>
🔒 Wall Extraction
</li>


<li>
🔒 Material Estimation
</li>


<li>
🔒 3D Visualization
</li>


</ul>




</div>


  );

}



export default BlueprintPage;