import api from "../api/axios";


export interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;

  firstName: string;
  lastName: string;

  imageUrl: string;

  role: string;

  subscription: string;
}


export const getCurrentUser = async (
  token: string
) => {

  const response =
    await api.get(
      "/users/me",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return response.data;
};