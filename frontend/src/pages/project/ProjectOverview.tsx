import WorkspaceCard from "../../components/project/WorkspaceCard";



function ProjectOverview() {


  return (

    <div>


      <h2>
        📋 Project Overview
      </h2>



      <p>
        Manage your construction project
        from planning to completion.
      </p>





      <div

        style={{

          display:"grid",

          gridTemplateColumns:
          "repeat(2,1fr)",

          gap:"20px",

          marginTop:"25px",

        }}

      >



        <WorkspaceCard

          title="🏗 Project Status"

          description="Currently in planning phase"

        />



        <WorkspaceCard

          title="📅 Project Timeline"

          description="Construction timeline not created yet"

        />



        <WorkspaceCard

          title="📐 Blueprint"

          description="No blueprint uploaded"

        />



        <WorkspaceCard

          title="📦 Bill of Quantities"

          description="BOQ generation pending"

        />



        <WorkspaceCard

          title="💰 Cost Estimation"

          description="Cost calculation not available"

        />



        <WorkspaceCard

          title="👥 Collaboration"

          description="Only project owner has access"

        />



      </div>







      <hr />






      <h2>
        Quick Actions
      </h2>





      <div

        style={{

          display:"flex",

          gap:"15px",

          flexWrap:"wrap",

        }}

      >



        <button>

          📐 Create Floor Plan

        </button>



        <button>

          📤 Upload Blueprint

        </button>



        <button>

          📦 Generate BOQ

        </button>



        <button>

          💰 Estimate Cost

        </button>



      </div>





    </div>

  );

}



export default ProjectOverview;