import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import HomeownerDashboard from "../pages/homeowner/HomeownerDashboard";
import ProjectWorkspace from "../pages/homeowner/ProjectWorkspace";
import SharedWorkspace from "../pages/homeowner/SharedWorkspace";
import PricingPage from "../pages/project/PricingPage";
import ProjectOverview from "../pages/project/ProjectOverview";
import FloorPlanPage from "../pages/project/FloorPlanPage";
import BOQPage from "../pages/project/BOQPage";
import CostPage from "../pages/project/CostPage";
import TimelinePage from "../pages/project/TimelinePage";
import SharingPage from "../pages/project/SharingPage";
import ProjectSettings from "../pages/project/ProjectSettings";
import BlueprintPage from "../pages/project/BlueprintPage";
import AiRenderStudio from "../pages/project/AiRenderStudio";

import AdminDashboard from "../pages/admin/AdminDashboard";
import RoleRoute from "./RoleRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        <Route
          path="/homeowner"
          element={
            <RoleRoute
              allowedRoles={[
                "HOMEOWNER",
              ]}
            >
              <HomeownerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/projects/:id/shared-workspace"
          element={
            <SharedWorkspace />
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProjectWorkspace />
          }
        >
          <Route
            index
            element={
              <ProjectOverview />
            }
          />

          <Route
            path="floor-plan"
            element={
              <FloorPlanPage />
            }
          />

          <Route
            path="boq"
            element={
              <BOQPage />
            }
          />

          <Route
            path="cost"
            element={
              <CostPage />
            }
          />

          <Route
            path="timeline"
            element={
              <TimelinePage />
            }
          />

          <Route
            path="sharing"
            element={
              <SharingPage />
            }
          />

          <Route
            path="settings"
            element={
              <ProjectSettings />
            }
          />

          <Route
            path="blueprint"
            element={
              <BlueprintPage />
            }
          />
          

          <Route
            path="ai-render"
            element={
              <AiRenderStudio />
            }
          />

          
        </Route>
  <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;