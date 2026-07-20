interface ProjectHeaderProps {

  projectName:string;

  location:string;

  status:string;

}



function ProjectHeader(
{
 projectName,
 location,
 status,
}:ProjectHeaderProps
) {


return (

<div>


<h1>
🏗 {projectName}
</h1>


<p>
📍 {location}
</p>


<p>
Status:
{" "}
{status}
</p>



<button>
🔗 Share
</button>


{" "}


<button>
⚙ Settings
</button>



</div>

);


}


export default ProjectHeader;