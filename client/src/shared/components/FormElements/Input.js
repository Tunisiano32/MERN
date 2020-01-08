import React, { useReducer, useEffect } from "react";
import { validate } from "../../utils/validators";
import "./Input.css";

const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators)
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true
      };
    default:
      return state;
  }
};

const Input = props => {
  const {
    id,
    label,
    element,
    rows,
    type,
    placeholder,
    errorText,
    validators,
    onInput,
    initialValue,
    initialValid
  } = props;
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: initialValue || "",
    isValid: initialValid || false,
    isTouched: false
  });

  useEffect(() => {
    onInput(id, inputState.value, inputState.isValid);
  }, [id, onInput, inputState.value, inputState.isValid]);

  const changeHandler = event => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: validators
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH"
    });
  };

  const control =
    element === "input" ? (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    ) : (
      <textarea
        id={id}
        rows={rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );
  const isInvalid = !inputState.isValid && inputState.isTouched;
  return (
    <div className={`form-control ${isInvalid && "form-control--invalid"}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {isInvalid && <p>{errorText}</p>}
    </div>
  );
};

export default Input;
