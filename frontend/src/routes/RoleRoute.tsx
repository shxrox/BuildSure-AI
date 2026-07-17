import {
  Navigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  useUserContext,
} from "../context/AuthContext";


interface RoleRouteProps {

  allowedRoles: string[];

  children: ReactNode;

}


function RoleRoute({
  allowedRoles,
  children,
}: RoleRouteProps) {


  const {
    user,
    loading,
  } = useUserContext();


  console.log("RoleRoute");
  console.log("loading:", loading);
  console.log("user:", user);
  console.log("role:", user?.role);



  if (loading) {

    return <h2>Loading...</h2>;

  }



  if (!user) {

    console.log("Redirecting to login");

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }



  if (!allowedRoles.includes(user.role)) {

    console.log("Redirecting to login");

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }



  return (
    <>
      {children}
    </>
  );

}


export default RoleRoute;