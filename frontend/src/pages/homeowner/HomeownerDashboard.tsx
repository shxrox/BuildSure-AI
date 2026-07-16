import { useUserContext } from "../../context/AuthContext";

function HomeownerDashboard() {

  const { user } = useUserContext();

  return (

    <div>

      <h1>🏠 Homeowner Dashboard</h1>

      <hr />

      <p>Name: {user?.firstName}</p>

      <p>Email: {user?.email}</p>

      <p>Role: {user?.role}</p>

    </div>

  );

}

export default HomeownerDashboard;