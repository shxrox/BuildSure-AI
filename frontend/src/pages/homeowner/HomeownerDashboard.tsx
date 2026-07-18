
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useClerk,
} from "@clerk/clerk-react";


import {
  useUserContext,
} from "../../context/AuthContext";


import {
  getProjects,
  createProject,
} from "../../services/project.service";


import {
  deleteAccount,
} from "../../services/user.service";


import type {
  Project,
} from "../../services/project.service";





function HomeownerDashboard() {


  const {
    user,
  } = useUserContext();




  const {
    signOut,
  } = useClerk();





  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);


  const navigate = useNavigate();


  const [
    loading,
    setLoading,
  ] = useState(true);





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
    creatingProject,
    setCreatingProject,
  ] = useState(false);





  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);





  const [
    deleteConfirmText,
    setDeleteConfirmText,
  ] = useState("");





  const [
    deleting,
    setDeleting,
  ] = useState(false);








  const loadProjects =
    async () => {


      try {


        const data =
          await getProjects();


        setProjects(
          data
        );


      } catch (error) {


        console.log(
          "Failed to load projects",
          error
        );


      } finally {


        setLoading(false);


      }


    };






  useEffect(() => {


    loadProjects();


  }, []);







  const handleLogout =
    async () => {


      await signOut({

        redirectUrl: "/",

      });


    };








  const handleCreateProject =
    async () => {


      if (
        !projectName ||
        !location ||
        !description
      ) {

        return;

      }



      try {


        setCreatingProject(true);



        await createProject({

          projectName,

          location,

          description,

        });




        setProjectName("");

        setLocation("");

        setDescription("");



        await loadProjects();




      } catch (error) {


        console.log(
          "Failed to create project",
          error
        );


      } finally {


        setCreatingProject(false);


      }


    };








  const handleDeleteAccount =
    async () => {


      if (
        deleteConfirmText !== "DELETE"
      ) {

        return;

      }



      try {


        setDeleting(true);



        await deleteAccount();



        await signOut({

          redirectUrl: "/",

        });



      } catch (error) {


        console.log(
          "Failed to delete account",
          error
        );


        setDeleting(false);


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





      <div>


        <h3>
          Profile
        </h3>




        {
          user?.imageUrl && (

            <img

              src={user.imageUrl}

              alt="Profile"

              width="80"

              height="80"

            />

          )
        }





        <p>
          Name:
          {" "}
          {user?.firstName}
          {" "}
          {user?.lastName}
        </p>




        <p>
          Email:
          {" "}
          {user?.email}
        </p>




        <p>
          Role:
          {" "}
          {user?.role}
        </p>





        <button
          onClick={handleLogout}
        >

          Logout

        </button>




      </div>






      <hr />






      <h2>
        Create New Project
      </h2>





      <div>


        <input

          value={projectName}

          onChange={(e) =>
            setProjectName(
              e.target.value
            )
          }

          placeholder="Project Name"

        />



        <br />



        <input

          value={location}

          onChange={(e) =>
            setLocation(
              e.target.value
            )
          }

          placeholder="Location"

        />



        <br />



        <textarea

          value={description}

          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }

          placeholder="Description"

        />



        <br />



        <button

          onClick={handleCreateProject}

          disabled={creatingProject}

        >

          {
            creatingProject
              ? "Creating..."
              : "Create Project"
          }


        </button>



      </div>







      <hr />






      <h2>
        My Construction Projects
      </h2>






      {
        loading && (

          <p>
            Loading projects...
          </p>

        )
      }





      {
        !loading &&
        projects.length === 0 && (

          <p>
            No projects created yet.
          </p>

        )
      }







      {
        projects.map(

          (project) => (


            <div

              key={project._id}

              onClick={() =>
                navigate(
                  `/projects/${project._id}`
                )
              }

              style={{

                border: "1px solid black",

                padding: "15px",

                margin: "15px 0",

                cursor: "pointer",

              }}

            >


              <h3>
                {project.projectName}
              </h3>



              <p>
                Location:
                {" "}
                {project.location}
              </p>



              <p>
                Description:
                {" "}
                {project.description}
              </p>



              <p>
                Status:
                {" "}
                {project.status}
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

        )
      }







      <hr />






      <h2>
        Danger Zone
      </h2>



      <button

        onClick={() =>
          setShowDeleteModal(true)
        }

        style={{

          background: "red",

          color: "white",

          padding: "10px",

        }}

      >

        Delete Account

      </button>







      {
        showDeleteModal && (

          <div>


            <h3>
              Confirm Delete Account
            </h3>


            <input

              value={deleteConfirmText}

              onChange={(e) =>
                setDeleteConfirmText(
                  e.target.value
                )
              }

              placeholder="Type DELETE"

            />



            <button

              onClick={handleDeleteAccount}

              disabled={
                deleting ||
                deleteConfirmText !== "DELETE"
              }

            >

              {
                deleting
                  ? "Deleting..."
                  : "Confirm Delete"
              }


            </button>




            <button

              onClick={() => {

                setShowDeleteModal(false);

                setDeleteConfirmText("");

              }}

            >

              Cancel

            </button>



          </div>

        )
      }





    </div>

  );


}



export default HomeownerDashboard;