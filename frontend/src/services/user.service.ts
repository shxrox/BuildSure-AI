// import api from "./api";


// export interface UserProfile {

//   _id: string;

//   email: string;

//   firstName: string;

//   lastName: string;

//   imageUrl: string;

//   role: string;

//   subscription: string;

// }




// export const getCurrentUser =
// async (): Promise<UserProfile> => {


//   const response =
//     await api.get(
//       "/users/me"
//     );


//   return response.data.data;


// };

import api from "./api";



export interface UserProfile {

  _id: string;

  email: string;

  firstName: string;

  lastName: string;

  imageUrl: string;

  role: string;

  subscription: string;

}




export const getCurrentUser =
async (): Promise<UserProfile> => {


  const response =
    await api.get(
      "/users/me"
    );


  return response.data.data;


};






export const deleteAccount =
async (): Promise<void> => {


  await api.delete(
    "/users/me"
  );


};