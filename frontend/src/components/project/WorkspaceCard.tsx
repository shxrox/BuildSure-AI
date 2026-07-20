interface WorkspaceCardProps {

title:string;

description:string;

}



function WorkspaceCard(
{
 title,
 description,
}:WorkspaceCardProps
) {


return (

<div

style={{

border:"1px solid #ddd",

padding:"20px",

borderRadius:"10px",

}}

>


<h3>
{title}
</h3>


<p>
{description}
</p>


</div>

);


}


export default WorkspaceCard;