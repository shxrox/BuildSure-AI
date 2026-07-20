import {
  useEffect,
  useState,
} from "react";


import {
  useParams,
} from "react-router-dom";


import api from "../../services/api";



interface Project {

  _id:string;

  projectName:string;

  location:string;

  description:string;

  status:string;

  createdAt:string;

}





function ProjectWorkspace() {


  const {
    id,
  } = useParams();



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


      } catch(error) {


        console.log(
          "Failed to load workspace",
          error
        );


      } finally {


        setLoading(false);

      }


    };



    if(id) {

      loadProject();

    }


  },[id]);







  if(loading) {


    return (

      <h2>
        Loading workspace...
      </h2>

    );

  }







  if(!project) {


    return (

      <h2>
        Project not found
      </h2>

    );

  }








  return (

    <div>


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





      <h2>
        Project Workspace
      </h2>




      <div>


        <h3>
          📋 Overview
        </h3>

        <p>
          {project.description}
        </p>


      </div>






      <hr />





      <h2>
        Tools
      </h2>




      <ul>

        <li>
          📐 Floor Plan
        </li>


        <li>
          📤 Blueprint Upload
        </li>


        <li>
          📦 Bill of Quantities
        </li>


        <li>
          💰 Cost Estimation
        </li>


        <li>
          📅 Construction Timeline
        </li>


        <li>
          👥 Sharing & Collaboration
        </li>


      </ul>





    </div>

  );

}



export default ProjectWorkspace;