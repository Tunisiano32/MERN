import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";
import "./PlaceForm.css";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from "../../shared/utils/validators";

const UpdatePlace = () => {
  const placeId = useParams().placeId;
  const [loadedPlace, setLoadedPlace] = useState();
  const history = useHistory();
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false
      },
      description: {
        value: "",
        isValid: false
      }
    },
    false
  );

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKENDURL}api/places/${placeId}`
        );
        const selectedPlace = responseData.place;
        setLoadedPlace(selectedPlace);
        setFormData(
          {
            title: {
              value: selectedPlace.title,
              isValid: true
            },
            description: {
              value: selectedPlace.description,
              isValid: true
            }
          },
          true
        );
      } catch (err) {}
    };
    loadPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async event => {
    event.preventDefault();

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKENDURL}api/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token
        }
      );
      history.push(`/${auth.userId}/places`);
    } catch (error) {
      console.log(error);
    }
  };

  if (!loadedPlace) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find the place</h2>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="center">
        <Card>
          <h2>Loading...</h2>;
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      <ErrorModal
        error={error}
        onClear={() => {
          clearError(null);
        }}
      />

      <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          type="text"
          element="input"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title"
          onInput={inputHandler}
          initialValue={loadedPlace.title}
          initialValid={true}
        />

        <Input
          id="description"
          type="text"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description at least 5 chars."
          onInput={inputHandler}
          initialValue={loadedPlace.description}
          initialValid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default UpdatePlace;
