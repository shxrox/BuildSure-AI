
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
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
import ThreeDPlanPage from "../pages/project/ThreeDPlanPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RoleRoute from "./RoleRoute";
import AdminFinancialsPage from "../pages/admin/AdminFinancialsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminProjectsPage from "../pages/admin/AdminProjectsPage";
import AdminHealthPage from "../pages/admin/AdminHealthPage";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/homeowner"
          element={
            <RoleRoute allowedRoles={["HOMEOWNER"]}>
              <HomeownerDashboard />
            </RoleRoute>
          }
        />

        <Route path="/projects/:id/shared-workspace" element={<SharedWorkspace />} />

        <Route path="/projects/:id" element={<ProjectWorkspace />}>
          <Route index element={<ProjectOverview />} />
          <Route path="floor-plan" element={<FloorPlanPage />} />
          <Route path="boq" element={<BOQPage />} />
          <Route path="cost" element={<CostPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="sharing" element={<SharingPage />} />
          <Route path="settings" element={<ProjectSettings />} />
          <Route path="blueprint" element={<BlueprintPage />} />
          <Route path="/projects/:id/3d-plan" element={<ThreeDPlanPage />} />
          <Route path="ai-render" element={<AiRenderStudio />} />
        </Route>

        <Route path="/pricing" element={<PricingPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/financials"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminFinancialsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminProjectsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/health"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminHealthPage />
            </RoleRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;