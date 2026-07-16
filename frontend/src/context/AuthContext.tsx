import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


import {
  useAuth,
} from "@clerk/clerk-react";


import type {
  ReactNode,
} from "react";


import {
  getCurrentUser,
} from "../services/user.service";


import type {
  UserProfile,
} from "../services/user.service";


import {
  setupAxiosInterceptors,
} from "../services/api";



interface AuthContextType {

  user: UserProfile | null;

  loading: boolean;

  refreshUser: () => Promise<void>;

}



const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );





export function AuthProvider({
  children,
}: {
  children: ReactNode;

}) {


  const {

    getToken,

    isLoaded,

    isSignedIn,

  } = useAuth();




  const [user,setUser] =
    useState<UserProfile | null>(null);



  const [loading,setLoading] =
    useState(true);





  // Setup axios token
  useEffect(()=>{


    setupAxiosInterceptors(
      getToken
    );


  },[getToken]);






  const refreshUser =
  async()=>{


    try {


      if(!isLoaded){

        return;

      }




      if(!isSignedIn){


        setUser(null);

        return;

      }





      const userData =
        await getCurrentUser();



      console.log(
        "FINAL USER:",
        userData
      );


      console.log(
        "USER ROLE:",
        userData.role
      );



      setUser(
        userData
      );



    }
    catch(error){


      console.log(
        "User loading failed",
        error
      );


      setUser(null);


    }


  };







  useEffect(()=>{


    if(!isLoaded){

      return;

    }



    const loadUser =
    async()=>{


      await refreshUser();


      setLoading(false);


    };



    loadUser();



  },[
    isLoaded,
    isSignedIn
  ]);








  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

        refreshUser,

      }}

    >

      {children}

    </AuthContext.Provider>

  );


}









export function useUserContext(){


  const context =
    useContext(
      AuthContext
    );



  if(!context){


    throw new Error(
      "useUserContext must be used inside AuthProvider"
    );


  }


  return context;


}