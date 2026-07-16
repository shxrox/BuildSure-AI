import { useUserContext } from "../context/AuthContext";

function Home() {

  const { user } = useUserContext();

  return (
    <div>

      <h1>Home</h1>

      <p>
        {user?.firstName}
      </p>

      <p>
        {user?.role}
      </p>

    </div>
  );

}

export default Home;