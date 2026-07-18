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





function ProjectDetails() {


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
          "Failed to load project",
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

      <div>

        <h2>
          Loading project...
        </h2>

      </div>

    );


  }







  if(!project) {


    return (

      <div>

        <h2>
          Project not found
        </h2>


      </div>

    );


  }








  return (

    <div>


      <h1>
        🏗 Project Details
      </h1>



      <hr />




      <h2>
        {project.projectName}
      </h2>





      <p>

        <strong>
          Location:
        </strong>

        {" "}

        {project.location}

      </p>






      <p>

        <strong>
          Description:
        </strong>

        {" "}

        {project.description}

      </p>







      <p>

        <strong>
          Status:
        </strong>

        {" "}

        {project.status}

      </p>






      <p>

        <strong>
          Created:
        </strong>

        {" "}

        {
          new Date(
            project.createdAt
          ).toLocaleDateString()
        }

      </p>







      <hr />





      <h2>
        🚧 Upcoming Features
      </h2>





      <ul>

        <li>
          📐 Blueprint Upload
        </li>


        <li>
          📦 Bill of Quantities Generator
        </li>


        <li>
          🤖 AI 3D Visualization
        </li>


        <li>
          💰 Cost Estimation
        </li>


        <li>
          📅 Construction Timeline
        </li>


      </ul>





    </div>

  );


}



export default ProjectDetails;