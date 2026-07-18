import api from "./api";


export interface Project {

  _id: string;

  projectName: string;

  location: string;

  description: string;

  status: string;

  createdAt: string;

  updatedAt: string;

}



export interface CreateProjectData {

  projectName: string;

  location: string;

  description: string;

}




export async function createProject(
  data: CreateProjectData
): Promise<Project> {


  const response =
    await api.post(

      "/projects",

      data

    );


  return response.data.data;

}





export async function getProjects()
: Promise<Project[]> {


  const response =
    await api.get(

      "/projects"

    );


  return response.data.data;

}