import React from "react";
import type { RootState } from "../redux/store"; // <-- "import type" use karo yahan
import { useSelector } from "react-redux";
const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <div>
      <h2>User Profile</h2>
      <div>Name: {user?.name}</div>
      <div>Email: {user?.email}</div>
      <div>Role: {user?.role}</div>
    </div>
  );
};

export default Profile;
