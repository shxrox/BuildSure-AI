// import api from "./api";

// export interface Project {
//   _id: string;
//   projectName: string;
//   location: string;
//   description: string;
//   status: string;
//   completedMilestones?: string[];
//   collaborators?: string[];

//   blueprint?: {
//     fileName: string;
//     fileType: string;
//     fileUrl: string;
//     uploadedAt: string;
//   };

//   createdAt: string;
//   updatedAt: string;
// }

// export interface DigitalPlan {
//   walls: any[];
//   rooms: any[];
//   doors: any[];
//   windows: any[];
// }

// export const getProjects = async (): Promise<Project[]> => {
//   const response = await api.get("/projects");
//   return response.data.data;
// };

// export const updateProject = async (id: string, updateData: any) => {
//   const response = await api.patch(`/projects/${id}`, updateData);
//   return response.data;
// };

// export const getProjectById = async (id: string): Promise<Project> => {
//   const response = await api.get(`/projects/${id}`);
//   return response.data.data;
// };

// export const createProject = async (data: {
//   projectName: string;
//   location: string;
//   description: string;
// }): Promise<Project> => {
//   const response = await api.post("/projects", data);
//   return response.data.data;
// };

// export const deleteProject = async (id: string): Promise<void> => {
//   await api.delete(`/projects/${id}`);
// };

// export const uploadBlueprint = async (projectId: string, file: File) => {
//   const formData = new FormData();
//   formData.append("blueprint", file);

//   const response = await api.post(`/projects/${projectId}/blueprint`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return response.data.data;
// };

// export const getDigitalPlan = async (projectId: string) => {
//   try {
//     const response = await api.get(`/projects/${projectId}/digital-plan`);
//     return response.data.data;
//   } catch (error) {
//     console.log("No digital plan found or failed to load", error);
//     return null;
//   }
// };

// export const updateDigitalPlan = async (projectId: string, digitalPlan: any) => {
//   const response = await api.put(`/projects/${projectId}/digital-plan`, digitalPlan);
//   return response.data.data;
// };

// export const saveDigitalPlan = async (projectId: string, digitalPlan: any) => {
//   return await updateDigitalPlan(projectId, digitalPlan);
// };

import api from "./api";

export interface Project {
  _id: string;
  projectName: string;
  location: string;
  description: string;
  status: string;
  completedMilestones?: string[];
  collaborators?: string[];

  blueprint?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface DigitalPlan {
  walls: any[];
  rooms: any[];
  doors: any[];
  windows: any[];
  furniture?: any[];
  costSettings?: {
    actualSpent: number;
    rates: {
      cementRate: number;
      brickRate: number;
      sandRate: number;
      tileRate: number;
      laborRatePerSqm: number;
    };
  };
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");
  return response.data.data;
};

export const updateProject = async (id: string, updateData: any) => {
  const response = await api.patch(`/projects/${id}`, updateData);
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await api.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async (data: {
  projectName: string;
  location: string;
  description: string;
}): Promise<Project> => {
  const response = await api.post("/projects", data);
  return response.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

export const uploadBlueprint = async (projectId: string, file: File) => {
  const formData = new FormData();
  formData.append("blueprint", file);

  const response = await api.post(`/projects/${projectId}/blueprint`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const getDigitalPlan = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}/digital-plan`);
    return response.data.data;
  } catch (error) {
    console.log("No digital plan found or failed to load", error);
    return null;
  }
};

export const updateDigitalPlan = async (projectId: string, digitalPlan: any) => {
  const response = await api.put(`/projects/${projectId}/digital-plan`, digitalPlan);
  return response.data.data;
};

export const saveDigitalPlan = async (projectId: string, digitalPlan: any) => {
  return await updateDigitalPlan(projectId, digitalPlan);
};

export const getCostSettings = async (projectId: string) => {
  const plan = await getDigitalPlan(projectId);
  return plan?.costSettings || null;
};

export const saveCostSettings = async (projectId: string, costSettings: any) => {
  const plan = await getDigitalPlan(projectId) || { walls: [], rooms: [], doors: [], windows: [], furniture: [] };
  plan.costSettings = costSettings;
  return await updateDigitalPlan(projectId, plan);
};