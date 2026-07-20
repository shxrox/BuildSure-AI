import api from "./api";



export interface Project {

  _id: string;

  projectName: string;

  location: string;

  description: string;

  status: string;


  blueprint?: {

    fileName: string;

    fileType: string;

    fileUrl: string;

    uploadedAt: string;

  };


  createdAt: string;

  updatedAt: string;

}







export const getProjects =
async (): Promise<Project[]> => {


  const response =
    await api.get(
      "/projects"
    );


  return response.data.data;

};







export const getProjectById =
async (
  id:string
): Promise<Project> => {


  const response =
    await api.get(
      `/projects/${id}`
    );


  return response.data.data;

};








export const createProject =
async (
  data: {

    projectName:string;

    location:string;

    description:string;

  }

): Promise<Project> => {


  const response =
    await api.post(

      "/projects",

      data

    );


  return response.data.data;

};








export const deleteProject =
async (
  id:string
): Promise<void> => {


  await api.delete(

    `/projects/${id}`

  );


};









export const uploadBlueprint =
async (

  projectId:string,

  file:File

) => {



  const formData =
    new FormData();



  formData.append(

    "blueprint",

    file

  );






  const response =
    await api.post(

      `/projects/${projectId}/blueprint`,

      formData,

      {

        headers: {

          "Content-Type":
            "multipart/form-data",

        },

      }

    );





  return response.data.data;

};