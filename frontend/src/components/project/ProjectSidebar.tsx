import {
  useNavigate,
  useParams,
} from "react-router-dom";



interface ProjectSidebarProps {

  active: string;

  setActive:
    (value: string) => void;

}





function ProjectSidebar(
  {
    active,
    setActive,
  }: ProjectSidebarProps
) {


  const navigate =
    useNavigate();



  const {
    id,
  } = useParams();




  const menuItems = [

    {
      id:"overview",
      label:"📋 Overview",
    },
    
    {
      id:"blueprint",
      label:"📐 Blueprint",
    },

    {
      id:"floor-plan",
      label:"📐 Floor Plan",
    },

    {
      id:"boq",
      label:"📦 Bill of Quantities",
    },

    {
      id:"cost",
      label:"💰 Cost Estimation",
    },

    {
      id:"timeline",
      label:"📅 Timeline",
    },

    {
      id:"sharing",
      label:"👥 Sharing",
    },

    {
      id:"settings",
      label:"⚙️ Settings",
    },

  ];






  const handleNavigation =
  (page:string) => {


    setActive(
      page
    );


    if(page === "overview") {


      navigate(
        `/projects/${id}`
      );


      return;

    }



    navigate(
      `/projects/${id}/${page}`
    );


  };







  return (

    <div

      style={{

        width:"250px",

        borderRight:
        "1px solid #ccc",

        padding:"20px",

        minHeight:"650px",

      }}

    >



      <h3>
        Workspace
      </h3>





      {
        menuItems.map(

          (item)=>(

            <button

              key={
                item.id
              }


              onClick={() =>
                handleNavigation(
                  item.id
                )
              }



              style={{

                display:"block",

                width:"100%",

                padding:"10px",

                marginBottom:"8px",

                cursor:"pointer",

                fontWeight:
                  active === item.id
                  ? "bold"
                  : "normal",

              }}

            >

              {item.label}

            </button>


          )

        )
      }



    </div>

  );

}



export default ProjectSidebar;