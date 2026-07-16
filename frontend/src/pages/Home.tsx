import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

function Home() {
  const { getToken } = useAuth();

  const handleGetToken = async () => {
    try {
      const token = await getToken();

      console.log("========== CLERK JWT ==========");
      console.log(token);
      console.log("================================");

      alert("JWT printed in browser console.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-4xl font-bold">
        BuildSure-AI
      </h1>

      <SignedOut>
        <p>Please login first.</p>
      </SignedOut>

      <SignedIn>

        <UserButton />

        <button
          onClick={handleGetToken}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Get JWT Token
        </button>

      </SignedIn>

    </div>
  );
}

export default Home;