import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import SampleExtraInline from "../SampleExtraInline";

type ComponentOptionsType = {
    [key: string]: Component;
}

// Store all custom_inlines values and components they should render here
const componentOptions: ComponentOptionsType = {
    'sample_extra': () => <SampleExtraInline />
}

// Renders the Extra Inline Component based on the name defined in the modeladmin.extra_inlines
const DynamicExtraInline: Component<{ componentName: string; }> = (props) => {
    return (
        <>
            <Dynamic component={componentOptions[props.componentName]} />
        </>
    );
}

export default DynamicExtraInline;