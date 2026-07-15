import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";


function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-4xl font-bold text-slate-800">
        BuildSure-AI
      </h1>

      <SignedOut>
        <p className="text-slate-600">
          User is not logged in
        </p>
      </SignedOut>

      <SignedIn>
        <p className="text-green-600">
          User authenticated
        </p>

        <UserButton />
      </SignedIn>

    </div>
  );
}

export default App;