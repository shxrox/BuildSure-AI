import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";


function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-4xl font-bold">
        BuildSure-AI
      </h1>


      <SignedOut>
        <p>
          Please login to continue
        </p>
      </SignedOut>


      <SignedIn>
        <p>
          Welcome to BuildSure-AI
        </p>

        <UserButton />
      </SignedIn>

    </div>
  );
}

export default Home;