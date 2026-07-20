import {
 Outlet,
} from "react-router-dom";


import ProjectSidebar from "./ProjectSidebar";

import ProjectHeader from "./ProjectHeader";



interface ProjectLayoutProps {

project:any;

active:string;

setActive:
(value:string)=>void;

}



function ProjectLayout(
{
project,
active,
setActive,
}:ProjectLayoutProps
) {


return (

<div

style={{

display:"flex",

}}

>



<ProjectSidebar

active={active}

setActive={setActive}

/>




<div

style={{

flex:1,

padding:"30px",

}}

>


<ProjectHeader

projectName={
project.projectName
}

location={
project.location
}

status={
project.status
}

/>



<hr />



<Outlet />



</div>



</div>

);


}


export default ProjectLayout;