import { Component } from "solid-js";
import { CustomInlineType } from "src/models/django-admin";
import { UserPermissionsType } from "src/models/user";

type SampleInlineTableHeaderProps = {
  componentName: string;
  parentAppLabel: string;
  parentModelName: string;
  parentPk: string;
  inline: CustomInlineType;
  userPermissions: UserPermissionsType;
};

const SampleInlineTableHeader: Component<SampleInlineTableHeaderProps> = (
  props
) => {
  return (
    <div>
      <p class="dark:text-white">App: {props.parentAppLabel}</p>
      <p class="dark:text-white">Model: {props.parentModelName}</p>
      <p class="dark:text-white">PK: {props.parentPk}</p>
    </div>
  );
};

export default SampleInlineTableHeader;
