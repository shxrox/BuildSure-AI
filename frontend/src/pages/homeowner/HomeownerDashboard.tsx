import {
  useEffect,
  useState,
} from "react";


import {
  useUserContext,
} from "../../context/AuthContext";


import {
  createProject,
  getProjects,
} from "../../services/project.service";


import type {
  Project,
} from "../../services/project.service";



function HomeownerDashboard() {


  const {
    user,
  } = useUserContext();



  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);



  const [
    showForm,
    setShowForm,
  ] = useState(false);



  const [
    projectName,
    setProjectName,
  ] = useState("");



  const [
    location,
    setLocation,
  ] = useState("");



  const [
    description,
    setDescription,
  ] = useState("");



  const [
    loading,
    setLoading,
  ] = useState(false);





  useEffect(() => {

    loadProjects();

  }, []);






  const loadProjects =
    async () => {


      try {


        const data =
          await getProjects();


        setProjects(
          data
        );


      } catch(error) {


        console.log(
          "Failed to load projects",
          error
        );


      }

    };







  const handleCreateProject =
    async () => {


      try {


        setLoading(true);



        await createProject({

          projectName,

          location,

          description,

        });



        await loadProjects();



        setProjectName("");

        setLocation("");

        setDescription("");

        setShowForm(false);



      } catch(error) {


        console.log(
          "Project creation failed",
          error
        );


        alert(
          "Failed to create project"
        );


      } finally {


        setLoading(false);


      }


    };






  return (

    <div>


      <h1>
        🏠 Homeowner Dashboard
      </h1>



      <hr />



      <h2>
        Welcome, {user?.firstName}
      </h2>



      <p>
        Email: {user?.email}
      </p>



      <p>
        Role: {user?.role}
      </p>



      <hr />



      <h2>
        My Construction Projects
      </h2>




      <button
        onClick={() =>
          setShowForm(true)
        }
      >
        + Create New Project
      </button>





      <hr />





      {
        projects.length === 0 ? (

          <p>
            No projects created yet.
          </p>

        ) : (

          projects.map(
            (project) => (

              <div
                key={project._id}
              >

                <h3>
                  {project.projectName}
                </h3>


                <p>
                  Location: {project.location}
                </p>


                <p>
                  Description: {project.description}
                </p>


                <p>
                  Status: {project.status}
                </p>


                <hr />

              </div>

            )

          )

        )

      }







      {
        showForm && (

          <div>


            <h3>
              Create Project
            </h3>



            <input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value
                )
              }
            />



            <br />



            <input
              placeholder="Location"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            />



            <br />



            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />



            <br />



            <button
              onClick={
                handleCreateProject
              }
              disabled={loading}
            >

              {
                loading
                ? "Creating..."
                : "Create Project"
              }

            </button>



          </div>

        )

      }



    </div>

  );

}


export default HomeownerDashboard;