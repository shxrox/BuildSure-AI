import axios from "axios";


const api = axios.create({

  baseURL:
    "http://localhost:5000/api/v1",

});



let interceptorAdded = false;



export const setupAxiosInterceptors =
async (
  getToken: () => Promise<string | null>
) => {


  if(interceptorAdded) return;


  api.interceptors.request.use(

    async (config) => {


      const token =
        await getToken();



      if(token){


        config.headers.Authorization =
          `Bearer ${token}`;


      }



      return config;


    }

  );


  interceptorAdded = true;


};




export default api;