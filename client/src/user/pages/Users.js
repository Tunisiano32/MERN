import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState([]);

  useEffect(() => {
    const getUsersData = async () => {
      try {
        const userData = await sendRequest(
          `${process.env.REACT_APP_BACKENDURL}api/users`
        );
        console.log(userData);
        setLoadedUsers(userData);
      } catch (error) {}
    };

    getUsersData();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal
        error={error}
        onClear={() => {
          clearError(null);
        }}
      />
      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />};
    </React.Fragment>
  );
};

export default Users;
