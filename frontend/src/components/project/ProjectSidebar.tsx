interface ProjectSidebarProps {

  active:string;

  setActive:
    (value:string)=>void;

}



function ProjectSidebar(
  {
    active,
    setActive,
  }:ProjectSidebarProps
) {


  const menuItems = [

    {
      id:"overview",
      label:"📋 Overview",
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




  return (

    <div
      style={{
        width:"250px",
        borderRight:"1px solid #ccc",
        padding:"20px",
        minHeight:"500px",
      }}
    >


      <h3>
        Workspace
      </h3>




      {
        menuItems.map(

          (item)=>(

            <button

              key={item.id}

              onClick={() =>
                setActive(
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