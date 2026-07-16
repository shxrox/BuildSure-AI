import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/Home";
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
          element={<Home />}
        />

        <Route
          path="/login"
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

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;