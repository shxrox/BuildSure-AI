// import {
//     useEffect,
//     useState
// } from "react";


// import {
//     useParams
// } from "react-router-dom";


// import {
//     getDigitalPlan,
//     updateDigitalPlan,
//     uploadBlueprint
// } from "../../services/project.service";


// import BlueprintCanvas from "../../components/blueprint/BlueprintCanvas";





// function BlueprintPage() {


//     const { id } = useParams();




//     const [plan, setPlan] = useState<any>({

//         walls: [],

//         rooms: [],

//         doors: [],

//         windows: []

//     });





//     const [walls, setWalls] = useState<any[]>([]);





//     const [file, setFile] = useState<File | null>(null);





//     const [uploading, setUploading] = useState(false);





//     const [saving, setSaving] = useState(false);









//     useEffect(() => {


//         const loadPlan = async () => {


//             if (!id)
//                 return;



//             try {


//                 const data =
//                     await getDigitalPlan(id);



//                 setPlan(data);



//                 setWalls(

//                     data.walls || []

//                 );



//             }
//             catch(error){


//                 console.error(

//                     "LOAD PLAN ERROR",

//                     error

//                 );


//             }


//         };



//         loadPlan();



//     },[id]);









//     useEffect(()=>{


//         setPlan(

//             (previous:any)=>({

//                 ...previous,

//                 walls

//             })

//         );


//     },[walls]);









//     const handleFileChange =
//     (
//         event:
//         React.ChangeEvent<HTMLInputElement>
//     )=>{


//         const selectedFile =
//             event.target.files?.[0];



//         if(selectedFile){


//             setFile(selectedFile);


//         }


//     };









//     const handleUpload =
//     async()=>{


//         if(!id || !file)
//             return;



//         try{


//             setUploading(true);



//             await uploadBlueprint(

//                 id,

//                 file

//             );



//             alert(

//                 "Editable blueprint uploaded successfully"

//             );



//         }
//         catch(error){


//             console.error(

//                 "UPLOAD ERROR",

//                 error

//             );


//         }
//         finally{


//             setUploading(false);


//         }



//     };









//     const savePlan =
//     async()=>{


//         if(!id)
//             return;



//         try{


//             setSaving(true);



//             await updateDigitalPlan(

//                 id,

//                 {

//                     ...plan,

//                     walls

//                 }

//             );



//             alert(

//                 "Digital plan saved"

//             );


//         }
//         catch(error){


//             console.error(

//                 "SAVE PLAN ERROR",

//                 error

//             );


//         }
//         finally{


//             setSaving(false);


//         }


//     };









//     return (

//         <div>


//             <h2>
//                 📐 Blueprint Workspace
//             </h2>





//             <p>
//                 Upload an editable construction plan and modify it digitally.
//             </p>







//             <div>


//                 <h3>
//                     Step 1: Upload Editable Blueprint
//                 </h3>




//                 <input


//                     type="file"


//                     accept=".svg,.json,.dxf"


//                     onChange={
//                         handleFileChange
//                     }


//                 />






//                 {
//                     file && (

//                         <div>

//                             <p>
//                                 Selected:
//                                 {" "}
//                                 {file.name}
//                             </p>


//                             <p>
//                                 Type:
//                                 {" "}
//                                 {file.type || "Unknown"}
//                             </p>


//                         </div>

//                     )
//                 }






//                 <button


//                     onClick={handleUpload}


//                     disabled={
//                         !file ||
//                         uploading
//                     }


//                 >


//                     {

//                     uploading

//                     ?

//                     "Uploading..."

//                     :

//                     "Upload Blueprint"

//                     }



//                 </button>



//             </div>










//             <hr />









//             <BlueprintCanvas


//                 walls={walls}


//                 setWalls={setWalls}


//                 imageUrl={undefined}


//             />









//             <div>


//                 <h3>
//                     Digital Plan
//                 </h3>


//                 <p>

//                     Walls:

//                     {" "}

//                     {walls.length}

//                 </p>






//                 <button


//                     onClick={savePlan}


//                     disabled={saving}


//                 >

//                     {

//                     saving

//                     ?

//                     "Saving..."

//                     :

//                     "Save Digital Plan"

//                     }


//                 </button>



//             </div>









//             <hr />








//             <h3>
//                 AI Processing Pipeline
//             </h3>



//             <ul>

//                 <li>
//                     ✅ Editable Blueprint Upload
//                 </li>

//                 <li>
//                     🔄 Convert File To Digital Plan
//                 </li>

//                 <li>
//                     🔒 Room Detection
//                 </li>

//                 <li>
//                     🔒 Wall Extraction
//                 </li>

//                 <li>
//                     🔒 Material Estimation
//                 </li>

//                 <li>
//                     🔒 3D Visualization
//                 </li>


//             </ul>






//         </div>

//     );


// }





// export default BlueprintPage;


import {
    useEffect,
    useState
} from "react";


import {
    useParams
} from "react-router-dom";


import {
    getDigitalPlan,
    updateDigitalPlan,
    uploadBlueprint
} from "../../services/project.service";


import BlueprintCanvas from "../../components/blueprint/BlueprintCanvas";





function BlueprintPage() {


    const { id } = useParams();




    const [plan, setPlan] = useState<any>({

        walls: [],

        rooms: [],

        doors: [],

        windows: []

    });





    const [walls, setWalls] = useState<any[]>([]);





    const [svgData, setSvgData] = useState<string>("");





    const [file, setFile] = useState<File | null>(null);





    const [uploading, setUploading] = useState(false);





    const [saving, setSaving] = useState(false);









    useEffect(() => {


        const loadPlan = async()=>{


            if(!id)
                return;



            try{


                const data =
                    await getDigitalPlan(id);



                setPlan(data);



                setWalls(

                    data.walls || []

                );


            }
            catch(error){


                console.error(

                    "LOAD PLAN ERROR",

                    error

                );


            }



        };



        loadPlan();



    },[id]);









    const handleFileChange =
    (
        event:
        React.ChangeEvent<HTMLInputElement>
    )=>{


        const selectedFile =
            event.target.files?.[0];



        if(selectedFile){

            setFile(selectedFile);

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




            setSvgData(

                response.svgData

            );



            alert(

                "Blueprint uploaded"

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









    const savePlan =
    async()=>{


        if(!id)
            return;



        try{


            setSaving(true);



            await updateDigitalPlan(

                id,

                {

                    ...plan,

                    walls

                }

            );



            alert(

                "Digital plan saved"

            );


        }
        catch(error){


            console.error(

                "SAVE ERROR",

                error

            );


        }
        finally{


            setSaving(false);


        }


    };











    return (

        <div>


            <h2>
                📐 Blueprint Workspace
            </h2>




            <p>
                Upload an editable construction plan and modify it digitally.
            </p>








            <h3>
                Step 1: Upload Editable Blueprint
            </h3>





            <input

                type="file"

                accept=".svg,.json,.dxf"

                onChange={handleFileChange}

            />






            <button

                onClick={handleUpload}

                disabled={
                    !file ||
                    uploading
                }

            >

                {

                uploading

                ?

                "Uploading..."

                :

                "Upload Blueprint"

                }


            </button>









            <BlueprintCanvas

                walls={walls}

                setWalls={setWalls}

                imageUrl={undefined}

                svgData={svgData}

            />









            <button

                onClick={savePlan}

                disabled={saving}

            >

                {

                saving

                ?

                "Saving..."

                :

                "Save Digital Plan"

                }


            </button>







        </div>

    );


}





export default BlueprintPage;