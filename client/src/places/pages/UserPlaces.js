import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaceList from "../components/PlaceList";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

const UserPlaces = () => {
  const creatorId = useParams().userId;
  const [places, setPlaces] = useState();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  useEffect(() => {
    const loadUserData = async () => {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKENDURL}api/places/user/${creatorId}`
      );
      setPlaces(responseData.places);
    };
    loadUserData();
  }, [creatorId, sendRequest]);

  const onDeletePlace = deletePlaceId => {
    setPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletePlaceId)
    );
  };

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      <ErrorModal
        error={error}
        onClear={() => {
          clearError(null);
        }}
      />
      {!isLoading && places && (
        <PlaceList items={places} onDeletePlace={onDeletePlace} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
