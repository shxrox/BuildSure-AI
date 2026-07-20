import {
  useEffect,
  useState,
} from "react";


import {
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";


import api from "../../services/api";


import ProjectLayout from "../../components/project/ProjectLayout";





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



  const location =
    useLocation();






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









  useEffect(() => {


    const currentPath =
      location.pathname
        .split("/")
        .pop();




    if(
      currentPath &&
      currentPath !== id
    ) {


      setActiveSection(
        currentPath
      );


    } else {


      setActiveSection(
        "overview"
      );

    }



  },[
    location.pathname,
    id,
  ]);









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

    <ProjectLayout

      project={
        project
      }

      active={
        activeSection
      }

      setActive={
        setActiveSection
      }

    >

      {/* <Outlet /> */}

    </ProjectLayout>

  );


}





export default ProjectWorkspace;