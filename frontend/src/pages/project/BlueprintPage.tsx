

import {
useEffect,
useState
} from "react";


import {
useParams
} from "react-router-dom";


import {
getDigitalPlan,
updateDigitalPlan
} from "../../services/project.service";




function BlueprintPage(){


const {id}=useParams();




const [plan,setPlan]=useState<any>({

walls:[],

rooms:[],

doors:[],

windows:[]

});



const [saving,setSaving]=useState(false);






useEffect(()=>{


const loadPlan =
async()=>{


if(!id)
return;



const data =
await getDigitalPlan(id);



setPlan(data);


};



loadPlan();



},[id]);









const savePlan =
async()=>{


if(!id)
return;



try{


setSaving(true);



await updateDigitalPlan(

id,

plan

);



alert(
"Digital plan saved"
);



}
catch(error){


console.error(
"PLAN SAVE ERROR",
error
);


}
finally{


setSaving(false);


}



};









return(

<div>


<h2>
📐 Blueprint Workspace
</h2>




<p>
Editable digital construction plan
</p>





<div>


<h3>
Walls
</h3>


<p>
{
plan.walls.length
}
walls detected
</p>




<h3>
Rooms
</h3>


<p>
{
plan.rooms.length
}
rooms detected
</p>




<h3>
Doors
</h3>


<p>
{
plan.doors.length
}
doors detected
</p>




<h3>
Windows
</h3>


<p>
{
plan.windows.length
}
windows detected
</p>




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





</div>

);


}



export default BlueprintPage;