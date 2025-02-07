import { Component } from "solid-js";

type LabelProps = {
    for: string;
    text: string;
};

const Label: Component<LabelProps> = (props) => {
    return (
        <label
          for={props.for}
          class="block mb-2 text-sm font-medium dark:text-white"
        >{props.text}</label>
    );
}

export default Label;