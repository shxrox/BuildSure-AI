import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


import Login from "../pages/Login";
import Register from "../pages/Register";


import HomeownerDashboard from "../pages/homeowner/HomeownerDashboard";


import RoleRoute from "./RoleRoute";



function AppRoutes() {


  return (

    <BrowserRouter>

      <Routes>


        {/* Default Login Page */}
        <Route
          path="/"
          element={
            <Login />
          }
        />



        {/* Register */}
        <Route
          path="/register"
          element={
            <Register />
          }
        />



        {/* Homeowner Dashboard */}
        <Route
          path="/homeowner"
          element={

            <RoleRoute
              allowedRoles={[
                "HOMEOWNER"
              ]}
            >

              <HomeownerDashboard />

            </RoleRoute>

          }
        />



      </Routes>


    </BrowserRouter>

  );

}


export default AppRoutes;