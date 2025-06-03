import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { ListviewDataType, ModelFieldsObjType } from "src/models/django-admin";
import SampleListviewTableHeader from "../SampleListviewTableHeader";
import { UserPermissionsType } from "src/models/user";

type ComponentOptionsType = {
  [key: string]: Component;
};

type DynamicListviewTableHeaderProps = {
  componentName: string;
  appLabel: string;
  modelName: string;
  listviewData: ListviewDataType;
  modelFields: ModelFieldsObjType;
  userPermissions: UserPermissionsType;
};

// Renders the Listview Table Header Component based on the name defined in the inline.table_header
const DynamicListviewTableHeader: Component<DynamicListviewTableHeaderProps> = (
  props
) => {
  const componentOptions: ComponentOptionsType = {
    // Store all dynamic listview table headers and components they should render here
    // sample_listview_table_header: () => <YourCustomTableHeader />
  };

  if (__IS_DEMO_MODE__) {
    componentOptions["sample_listview_table_header"] = () => (
      <SampleListviewTableHeader
        appLabel={props.appLabel}
        modelName={props.modelName}
        listviewData={props.listviewData}
        modelFields={props.modelFields}
      />
    );
  }

  return (
    <>
      <Dynamic component={componentOptions[props.componentName]} />
    </>
  );
};

export default DynamicListviewTableHeader;
