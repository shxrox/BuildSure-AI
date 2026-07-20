import {
  useEffect,
  useState,
} from "react";


import {
  useParams,
} from "react-router-dom";


import api from "../../services/api";

import ProjectSidebar from "../../components/project/ProjectSidebar";



interface Project {

  _id: string;

  projectName: string;

  location: string;

  description: string;

  status: string;

  createdAt: string;

}





function ProjectWorkspace() {


  const {
    id,
  } = useParams();



  const [
    activeSection,
    setActiveSection,
  ] = useState("overview");



  const [
    project,
    setProject,
  ] = useState<Project | null>(null);



  const [
    loading,
    setLoading,
  ] = useState(true);





  useEffect(() => {


    const loadProject =
      async () => {


        try {


          const response =
            await api.get(
              `/projects/${id}`
            );


          setProject(
            response.data.data
          );


        } catch (error) {


          console.log(
            "Failed to load workspace",
            error
          );


        } finally {


          setLoading(false);

        }


      };



    if (id) {

      loadProject();

    }


  }, [id]);







  if (loading) {


    return (

      <h2>
        Loading workspace...
      </h2>

    );

  }







  if (!project) {


    return (

      <h2>
        Project not found
      </h2>

    );

  }








  return (

    <div

      style={{

        display:"flex",

        minHeight:"600px",

      }}

    >



      <ProjectSidebar

        active={
          activeSection
        }

        setActive={
          setActiveSection
        }

      />






      <div

        style={{

          padding:"30px",

          flex:1,

        }}

      >



        <h1>
          🏗 {project.projectName}
        </h1>



        <p>
          📍 {project.location}
        </p>



        <p>
          Status:
          {" "}
          {project.status}
        </p>




        <hr />






        {
          activeSection === "overview" && (

            <div>


              <h2>
                📋 Overview
              </h2>



              <p>
                {project.description}
              </p>



              <p>
                Created:
                {" "}
                {
                  new Date(
                    project.createdAt
                  ).toLocaleDateString()
                }
              </p>



            </div>

          )
        }








        {
          activeSection !== "overview" && (

            <div>


              <h2>
                {activeSection}
              </h2>



              <p>
                This module will be implemented soon.
              </p>



            </div>

          )
        }





      </div>





    </div>

  );

}



export default ProjectWorkspace;