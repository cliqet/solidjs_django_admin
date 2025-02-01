import { Component } from "solid-js";

const ActionModalMessage: Component<{ action: string }> = (props) => {
  return (
    <div class="w-3/4 p-3 mx-auto">
      <h3 class="text-white">
        Are you sure you want to {props.action} these record/s?
      </h3>
    </div>
  );
};

export default ActionModalMessage;
