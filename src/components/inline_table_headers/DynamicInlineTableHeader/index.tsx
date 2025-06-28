import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { CustomInlineType } from "src/models/django-admin";
import { UserPermissionsType } from "src/models/user";
import SampleInlineTableHeader from "../SampleInlineTableHeader";

type ComponentOptionsType = {
  [key: string]: Component;
};

type DynamicInlineTableHeaderProps = {
  componentName: string;
  parentAppLabel: string;
  parentModelName: string;
  parentPk: string;
  inline: CustomInlineType;
  userPermissions: UserPermissionsType;
};

// Renders the Inline Table Header Component based on the name defined in the inline.table_header
const DynamicInlineTableHeader: Component<DynamicInlineTableHeaderProps> = (
  props
) => {
  const componentOptions: ComponentOptionsType = {
    // Store all dynamic inline table headers and components they should render here
    // sample_table_header: () => <YourCustomTableHeader />
  };

  if (__IS_DEMO_MODE__) {
    componentOptions["sample_table_header"] = () => (
      <SampleInlineTableHeader
        componentName={props.componentName}
        parentAppLabel={props.parentAppLabel}
        parentModelName={props.parentModelName}
        parentPk={props.parentPk}
        inline={props.inline}
        userPermissions={props.userPermissions}
      />
    );
  }

  return (
    <>
      <Dynamic component={componentOptions[props.componentName]} />
    </>
  );
};

export default DynamicInlineTableHeader;
