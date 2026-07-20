
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ProjectWorkspace from "../pages/homeowner/ProjectWorkspace";
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
          element={<ProjectWorkspace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;