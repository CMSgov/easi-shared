import React from "react";

import './index.scss'

export interface ModalProps {
  label: string;
}

const Modal = (props: ModalProps) => {
  return <button>{props.label}</button>;
};

export default Modal;
