import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

import {
  getCurrentUser,
} from "../services/user.service";


function Home() {

  const { getToken } = useAuth();


  const handleProfile = async () => {

    try {

      const token =
        await getToken();


      if (!token) {
        throw new Error(
          "No token found"
        );
      }


      const user =
        await getCurrentUser(
          token
        );


      console.log(
        "BuildSure User:",
        user
      );


    } catch (error) {

      console.error(
        error
      );

    }

  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">


      <h1 className="text-4xl font-bold">
        BuildSure-AI
      </h1>


      <SignedOut>
        <p>
          Please login first
        </p>
      </SignedOut>


      <SignedIn>

        <UserButton />


        <button
          onClick={handleProfile}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Load My Profile
        </button>


      </SignedIn>


    </div>
  );
}


export default Home;