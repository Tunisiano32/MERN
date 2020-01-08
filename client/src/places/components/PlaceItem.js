import React, { useState, useContext } from "react";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

import "./PlaceItem.css";

const PlaceItem = ({ place, onDelete }) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [showMap, setShowMap] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const auth = useContext(AuthContext);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const showConfirmDeleteHandler = () => setShowConfirm(true);
  const closeConfirmDeleteHandler = () => setShowConfirm(false);
  const confirmDeleteHandler = async () => {
    closeConfirmDeleteHandler();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKENDURL}api/places/${place.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token
        }
      );
      onDelete(place.id);
    } catch (error) {}
  };
  const { id, title, image, description, address, creator, location } = place;

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      <ErrorModal
        error={error}
        onClear={() => {
          clearError(null);
        }}
      />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={location} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirm}
        onCancel={closeConfirmDeleteHandler}
        header="Are you sure"
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={closeConfirmDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>Do you want to proceed and delete this place? </p>
      </Modal>

      <li className="place-item">
        <Card className="place-item__content">
          <div className="place-item__image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}${image}`}
              alt={title}
            />
          </div>
          <div className="place-item__info">
            <h2>{title}</h2>
            <h3>{address}</h3>
            <p>{description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>
            {auth.userId === creator && (
              <React.Fragment>
                <Button to={`/places/${id}`}>EDIT</Button>
                <Button danger onClick={showConfirmDeleteHandler}>
                  DELETE
                </Button>
              </React.Fragment>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
