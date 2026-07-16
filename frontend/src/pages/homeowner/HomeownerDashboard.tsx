import {
  useState,
} from "react";


import {
  useUserContext,
} from "../../context/AuthContext";



function HomeownerDashboard() {


  const {
    user,
  } = useUserContext();



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



  const handleCreateProject = () => {


    console.log(
      {
        projectName,
        location,
        description,
      }
    );


    alert(
      "Project form submitted"
    );


    setProjectName("");
    setLocation("");
    setDescription("");

    setShowForm(false);


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
            >
              Create Project
            </button>



          </div>

        )

      }



    </div>

  );

}


export default HomeownerDashboard;