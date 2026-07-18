// import {
//   useEffect,
//   useState,
// } from "react";


// import {
//   useUserContext,
// } from "../../context/AuthContext";


// import {
//   getProjects,
// } from "../../services/project.service";


// import type {
//   Project,
// } from "../../services/project.service";



// function HomeownerDashboard() {


//   const {
//     user,
//   } = useUserContext();



//   const [
//     projects,
//     setProjects,
//   ] = useState<Project[]>([]);



//   const [
//     loading,
//     setLoading,
//   ] = useState(true);





//   useEffect(() => {


//     const loadProjects =
//     async () => {


//       try {


//         const data =
//           await getProjects();


//         setProjects(
//           data
//         );


//       } catch(error) {


//         console.log(
//           "Failed to load projects",
//           error
//         );


//       } finally {


//         setLoading(false);


//       }


//     };



//     loadProjects();



//   }, []);





//   return (

//     <div>


//       <h1>
//         🏠 Homeowner Dashboard
//       </h1>



//       <hr />



//       <h2>
//         Welcome, {user?.firstName}
//       </h2>


//       <p>
//         Email: {user?.email}
//       </p>


//       <p>
//         Role: {user?.role}
//       </p>



//       <hr />



//       <h2>
//         My Construction Projects
//       </h2>




//       {
//         loading && (

//           <p>
//             Loading projects...
//           </p>

//         )
//       }




//       {
//         !loading &&
//         projects.length === 0 && (

//           <p>
//             No projects created yet.
//           </p>

//         )
//       }





//       {
//         projects.map(
//           (project) => (

//             <div
//               key={project._id}
//               style={{
//                 border:"1px solid black",
//                 padding:"15px",
//                 margin:"15px 0",
//               }}
//             >

//               <h3>
//                 {project.projectName}
//               </h3>


//               <p>
//                 Location:
//                 {" "}
//                 {project.location}
//               </p>


//               <p>
//                 Description:
//                 {" "}
//                 {project.description}
//               </p>


//               <p>
//                 Status:
//                 {" "}
//                 {project.status}
//               </p>


//               <p>
//                 Created:
//                 {" "}
//                 {
//                   new Date(
//                     project.createdAt
//                   ).toLocaleDateString()
//                 }
//               </p>


//             </div>

//           )

//         )
//       }





//     </div>

//   );

// }



// export default HomeownerDashboard;

import {
  useEffect,
  useState,
} from "react";


import {
  useClerk,
} from "@clerk/clerk-react";


import {
  useUserContext,
} from "../../context/AuthContext";


import {
  getProjects,
} from "../../services/project.service";


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



  const [
    loading,
    setLoading,
  ] = useState(true);





  useEffect(() => {


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


      } finally {


        setLoading(false);


      }


    };


    loadProjects();


  }, []);






  const handleLogout =
  async () => {


    await signOut({

      redirectUrl:"/",

    });


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
              style={{
                border:"1px solid black",
                padding:"15px",
                margin:"15px 0",
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



    </div>

  );

}



export default HomeownerDashboard;