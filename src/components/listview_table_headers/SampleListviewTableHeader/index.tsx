import { Component } from "solid-js";
import {
  ListviewDataType,
  ModelFieldsObjType,
} from "src/models/django-admin";

type SampleListviewTableHeaderProps = {
  appLabel: string;
  modelName: string;
  listviewData: ListviewDataType;
  modelFields: ModelFieldsObjType;
};

const SampleListviewTableHeader: Component<SampleListviewTableHeaderProps> = (
  props
) => {
  return (
    <div>
      <p class="dark:text-white">App: {props.appLabel}</p>
      <p class="dark:text-white">Model: {props.modelName}</p>
    </div>
  );
};

export default SampleListviewTableHeader;
