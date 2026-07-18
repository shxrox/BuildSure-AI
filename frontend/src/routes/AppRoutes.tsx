
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ProjectDetails from "../pages/homeowner/ProjectDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";

import HomeownerDashboard from "../pages/homeowner/HomeownerDashboard";

import RoleRoute from "./RoleRoute";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/homeowner"
          element={
            <RoleRoute
              allowedRoles={["HOMEOWNER"]}
            >
              <HomeownerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProjectDetails />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;