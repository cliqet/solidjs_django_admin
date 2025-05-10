import { Accessor, Setter } from "solid-js";
import { FIELDTYPE } from "src/constants/django-admin";
import {
  FieldsetType,
  FieldsInFormStateType,
  ModelAdminSettingsType,
  ModelFieldsObjType,
  SelectedOptionsType
} from "src/models/django-admin";
import { UserPermissionsType } from "src/models/user";

export const useModelAdmin = () => {
  const isReadOnlyField = (
    fieldName: string,
    readonlyFields: string[]
  ): boolean => {
    if (readonlyFields.includes(fieldName)) {
      return true;
    }
    return false;
  };
  
  const hasAppPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string
  ): boolean => {
    if (appLabel in userPermissions) {
      return true;
    }
    return false;
  };
  
  const hasModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    if (appLabel in userPermissions && modelName in userPermissions[appLabel]) {
      return true;
    }
    return false;
  };
  
  const hasAddModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    return (
      hasAppPermission(userPermissions, appLabel) &&
      hasModelPermission(userPermissions, appLabel, modelName) &&
      "add" in userPermissions[appLabel][modelName]["perms"]
    );
  };
  
  const hasViewModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    return (
      hasAppPermission(userPermissions, appLabel) &&
      hasModelPermission(userPermissions, appLabel, modelName) &&
      "view" in userPermissions[appLabel][modelName]["perms"]
    );
  };
  
  const hasChangeModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    return (
      hasAppPermission(userPermissions, appLabel) &&
      hasModelPermission(userPermissions, appLabel, modelName) &&
      "change" in userPermissions[appLabel][modelName]["perms"]
    );
  };
  
  const hasDeleteModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    return (
      hasAppPermission(userPermissions, appLabel) &&
      hasModelPermission(userPermissions, appLabel, modelName) &&
      "delete" in userPermissions[appLabel][modelName]["perms"]
    );
  };
  
  const hasViewOnlyModelPermission = (
    userPermissions: UserPermissionsType,
    appLabel: string,
    modelName: string
  ): boolean => {
    return (
      hasAppPermission(userPermissions, appLabel) &&
      hasModelPermission(userPermissions, appLabel, modelName) &&
      hasViewModelPermission(userPermissions, appLabel, modelName) &&
      !hasAddModelPermission(userPermissions, appLabel, modelName) &&
      !hasChangeModelPermission(userPermissions, appLabel, modelName) &&
      !hasDeleteModelPermission(userPermissions, appLabel, modelName)
    );
  };
  
  const formatDateString = (dateString: string): string => {
    const date = new Date(dateString);
  
    // match local timezone here with backend timezone
    return date.toLocaleTimeString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };
  
  const splitDateTimeString = (
    dateTimeString: string
  ): { date: string; time: string } => {
    if (!dateTimeString) {
      return {
        date: "",
        time: "",
      };
    }
  
    // Create a Date object from the datetime string
    const date = new Date(dateTimeString);
  
    // Extract the date
    const dateValue = date.toISOString().split("T")[0]; // YYYY-MM-DD
  
    // Extract the time including seconds
    const timeValue = date.toTimeString().split(" ")[0]; // HH:MM:SS
  
    return {
      date: dateValue,
      time: timeValue,
    };
  };
  
  const formatTimeForInput = (timeString: string): string => {
    try {
      // Split the string by ':'
      const [hours, minutes] = timeString.split(":");
  
      // Return the formatted time as HH:MM
      return `${hours}:${minutes}`;
    } catch (err) {
      return "";
    }
  };
  
  const getFilefieldLimits = (
    helpText: string
  ): { fileType: string; fileSize: number | null } => {
    // Defaults to accepting all file types
    let limits: { fileType: string; fileSize: number | null } = {
      fileType: "*/*",
      fileSize: null,
    };
    const [filetypePhrase, filesizePhrase] = helpText.split("|");
  
    // Regular expression to match content within square brackets
    const regexPattern = /\[(.*?)\]/;
  
    // Extract the match for file types
    const filetypeMatch = filetypePhrase.match(regexPattern);
    if (filetypeMatch) {
      const filetypes = filetypeMatch[1]
        .split(",")
        .map((item) => item.trim().replace(/'/g, ""));
      if (filetypes.length > 0) {
        limits.fileType = filetypes.join(",");
      }
    }
  
    const filesizeMatch = filesizePhrase.match(regexPattern);
    if (filesizeMatch) {
      const value = filesizeMatch[1].trim();
      limits.fileSize = parseInt(value, 10);
    }
  
    return limits;
  };
  
  /**
   *
   * @param dbFields
   * @param modelFields
   * @param fieldsInFormState
   * @param form
   * @returns the form data object for submission
   */
  const buildModelFormData = (
    modelFields: ModelFieldsObjType,
    fieldsInFormState: FieldsInFormStateType,
    form: HTMLFormElement
  ) => {
    let formData = new FormData(form);
    Object.keys(modelFields).forEach((fieldName) => {
      let fieldValue;
  
      // Handle values for file related fields
      if ([FIELDTYPE.FileField, FIELDTYPE.ImageField].includes(modelFields[fieldName].type)) {
        const fileMetadata = fieldsInFormState?.[fieldName].metadata;
        if (fileMetadata && fileMetadata.file) {
          fieldValue = fileMetadata.file;
        } else {
          fieldValue = "";
          formData.append(fieldName, fieldValue);
        }
      } else if (modelFields[fieldName].type === FIELDTYPE.JSONField) {
        formData.append(fieldName, JSON.stringify(fieldsInFormState?.[fieldName as string]?.value))
      } else {
        const value = fieldsInFormState?.[fieldName as string]?.value;
        if (typeof value === "string") {
          fieldValue = value.trim();
        } else {
          fieldValue = value;
        }
      }
  
      if (fieldValue !== undefined && fieldValue !== null) {
        formData.append(fieldName, fieldValue);
      }
    });
  
    return formData;
  };
  
  /**
   *
   * @param fieldsInFormState
   * @param err
   * @returns the updated fieldsInFormState with error state
   */
  const buildFieldStateOnError = (
    fieldsInFormState: FieldsInFormStateType,
    err: any
  ) => {
    let newFieldsState = { ...fieldsInFormState };
    Object.keys(err.validation_error).forEach((fieldNameError) => {
      newFieldsState[fieldNameError].isInvalid = true;
      newFieldsState[fieldNameError].errorMsg =
        err.validation_error[fieldNameError][0];
    });
  
    return newFieldsState;
  };
  
  /**
   *
   * @param fieldsInFormState
   * @param fieldName
   * @param value
   * @param metadata
   * @returns the new fieldsInFormState after one of the field changes value
   */
  const buildFieldStateOnFieldChange = (
    fieldsInFormState: FieldsInFormStateType,
    fieldName: string,
    value: any,
    metadata: any
  ) => {
    let newFieldsState = { ...fieldsInFormState };
    newFieldsState[fieldName].value = value;
    newFieldsState[fieldName].metadata = metadata;
  
    return newFieldsState;
  };
  
  /**
   *
   * @param id
   * @param fieldsInFormState
   * @param validationMessage
   * @param setFieldsInFormState
   * Updates the fieldsInFormState based on invalid fields on submission
   */
  const updateFieldStateOnInvalidFields = (
    id: string,
    fieldsInFormState: FieldsInFormStateType,
    validationMessage: string,
    setFieldsInFormState: Setter<FieldsInFormStateType>
  ) => {
    // Set state of field to invalid and add error message
    let newFieldsState = { ...fieldsInFormState };
    newFieldsState[id].isInvalid = true;
    newFieldsState[id].errorMsg = validationMessage;
    setFieldsInFormState(newFieldsState);
  
    // Handle special case for password2 field not equal to password. Assign the error message to password field
    // since password2 is not really one of the fields of a model
    if (
      fieldsInFormState?.["password2"] &&
      fieldsInFormState?.["password2"].isInvalid
    ) {
      if (
        fieldsInFormState?.["password2"].value !==
        fieldsInFormState?.["password"].value
      ) {
        let newFieldsState = { ...fieldsInFormState };
        newFieldsState["password"].isInvalid = true;
        newFieldsState["password"].errorMsg = "Both passwords must match";
        setFieldsInFormState({ ...newFieldsState });
      }
    }
  
    // Handle special case of datetime field where -date and -time is appended to id for the
    // date and time fields used
    if (
      (fieldsInFormState?.[`${id}-date`] &&
        fieldsInFormState?.[`${id}-date`].isInvalid) ||
      (fieldsInFormState?.[`${id}-time`] &&
        fieldsInFormState?.[`${id}-time`].isInvalid)
    ) {
      let newFieldsState = { ...fieldsInFormState };
      newFieldsState[id].isInvalid = true;
      newFieldsState[id].errorMsg = "Invalid date time";
      setFieldsInFormState({ ...newFieldsState });
    }
  };
  
  /**
   *
   * @param fieldsInFormState
   * @param field
   * @returns Builds the updated fieldsInFormState when a field is focused on
   */
  const buildFieldStateOnFocus = (
    fieldsInFormState: FieldsInFormStateType,
    field: string
  ) => {
    let newFieldsState = { ...fieldsInFormState };
    newFieldsState[field].isInvalid = false;
    newFieldsState[field].errorMsg = "";
    return newFieldsState;
  };
  
  const handleFetchError = (
    err: any
  ): {
    shouldNavigate: boolean;
    message: string;
  } => {
    let message = "";
    let shouldNavigate = false;
  
    if (err.status === 401) {
      shouldNavigate = true;
    } else if (err.status === 403) {
      message = "You do not have permission to access this page";
    } else if (err.status === 404) {
      message = "The resource could not be found";
    } else {
      message = "Something went wrong. Please refresh the page";
    }
  
    return {
      shouldNavigate,
      message
    };
  };
  
  const updateModelFieldsWithDbValues = (
    modelFields: ModelFieldsObjType,
    modelRecord: ModelFieldsObjType
  ) => {
    let newModelFields = { ...modelFields };
    Object.keys(newModelFields).forEach((fieldName) => {
      const record: any = modelRecord;
      const dbValue = record[fieldName];
  
      // Handle JSON field value on initialization
      if (newModelFields[fieldName].type === "JSONField") {
        newModelFields[fieldName].initial = dbValue;
      }
  
      // Handle CharFields that have text choices
      if (
        newModelFields[fieldName].type === "CharField" &&
        newModelFields[fieldName].choices
      ) {
        const textChoices = newModelFields[fieldName].choices.map((option) => {
          if (option.value === newModelFields[fieldName].initial) {
            return { ...option, selected: true };
          } else {
            return { ...option, selected: false };
          }
        });
  
        // Update model fields for foreign key selected item
        newModelFields[fieldName].choices = textChoices;
      }
  
      // Handle ForeignKey fields and set dropdown to current value
      if (newModelFields[fieldName].type === FIELDTYPE.ForeignKey) {
        const newForeignKeyChoices = newModelFields[
          fieldName
        ].foreignkey_choices?.map((option) => {
          if (option.value === newModelFields[fieldName].initial) {
            return { ...option, selected: true };
          } else {
            return { ...option, selected: false };
          }
        });
  
        // Update model fields for foreign key selected item
        newModelFields[fieldName].foreignkey_choices = newForeignKeyChoices;
      }
    });
  
    return newModelFields;
  };
  
  const initializeChangeFormFieldState = (
    modelAdminSettings: ModelAdminSettingsType,
    modelRecord: ModelFieldsObjType,
    modelFields: ModelFieldsObjType
  ) => {
    let formFields: FieldsInFormStateType = {};
  
    modelAdminSettings.fieldsets.forEach((fieldset: FieldsetType) => {
      fieldset.fields.forEach((field) => {
        const record: any = modelRecord;
        const dbValue = record[field];
  
        // Handle datetime fields by adding the id with suffix time for its time field
        if (modelFields[field].type === FIELDTYPE.DateTimeField) {
          formFields[`${field}-time`] = {
            fieldName: field,
            value: dbValue,
            isInvalid: false,
            errorMsg: "",
          };
        }
  
        // Add the actual field
        formFields[field] = {
          fieldName: field,
          value: dbValue,
          isInvalid: false,
          errorMsg: "",
          metadata: {},
        };
  
        // Handle the password2 field
        if (field === "password") {
          formFields["password2"] = {
            fieldName: field,
            value: "",
            isInvalid: false,
            errorMsg: "",
          };
        }
  
        // Handle many to many field value as list of ids selected
        if (modelFields[field].type === FIELDTYPE.ManyToManyField) {
          const initialSelected = dbValue.map(
            (item: { pk: string | number; string_value: string }) => {
              return item.pk;
            }
          );
  
          formFields[field].value = initialSelected;
        }
  
        // Handle file and image fields which uses metadata
        if (
          [FIELDTYPE.FileField, FIELDTYPE.ImageField].includes(
            modelFields[field].type
          )
        ) {
          formFields[field].metadata = {
            currentFilePathValue: dbValue,
            hasChanged: false,
            isValid: true, // on change mode, isValid is true
            file: "",
          };
        }
      });
    });
  
    return formFields;
  };
  
  const initializeAddFormFieldState = (
    modelAdminSettings: ModelAdminSettingsType,
    modelFields: ModelFieldsObjType
  ) => {
    let formFields: FieldsInFormStateType = {};
  
    modelAdminSettings.fieldsets.forEach((fieldset: FieldsetType) => {
      fieldset.fields.forEach((field) => {
        // Handle datetime fields by adding the id with suffix time for its time field
        if (modelFields[field].type === FIELDTYPE.DateTimeField) {
          formFields[`${field}-time`] = {
            fieldName: field,
            value: modelFields[field].initial,
            isInvalid: false,
            errorMsg: "",
          };
        }
  
        // Add the actual field
        formFields[field] = {
          fieldName: field,
          value: modelFields[field].initial,
          isInvalid: false,
          errorMsg: "",
        };
  
        // Handle the password2 field
        if (field === "password") {
          formFields["password2"] = {
            fieldName: field,
            value: "",
            isInvalid: false,
            errorMsg: "",
          };
        }
  
        // Handle many to many field value as list of ids selected
        if (modelFields[field].type === FIELDTYPE.ManyToManyField) {
          formFields[field].value = [];
        }
  
        // Handle file and image fields which uses metadata
        if (
          [FIELDTYPE.FileField, FIELDTYPE.ImageField].includes(
            modelFields[field].type
          )
        ) {
          formFields[field].metadata = {
            currentFilePathValue: "",
            hasChanged: false,
            isValid: false,
            file: "",
          };
        }
  
        // Handle ForeignKey field value and set first choice
        if ([FIELDTYPE.ForeignKey, FIELDTYPE.OneToOneField].includes(modelFields[field].type)) {
          const choices = modelFields[field]
            .foreignkey_choices as SelectedOptionsType[];
          if (choices.length > 0) {
            formFields[field].value = choices[0].value;
          }
        }
      });
    });
  
    return formFields;
  };

  const helpTextPrefix = (isRequired: boolean) => {
    return isRequired ? "Required: " : "Optional: ";
  };

  const handleOnFocus = (
    field: string,
    fieldsInFormState: FieldsInFormStateType,
    setFieldsInFormState: Setter<FieldsInFormStateType>
  ) => {
    const newFieldsState = buildFieldStateOnFocus(
      fieldsInFormState,
      field
    );
    setFieldsInFormState(newFieldsState);
  };


  return {
    isReadOnlyField,
    hasAppPermission,
    hasModelPermission,
    hasAddModelPermission,
    hasViewModelPermission,
    hasChangeModelPermission,
    hasDeleteModelPermission,
    hasViewOnlyModelPermission,
    formatDateString,
    splitDateTimeString,
    formatTimeForInput,
    getFilefieldLimits,
    buildModelFormData,
    buildFieldStateOnError,
    buildFieldStateOnFieldChange,
    updateFieldStateOnInvalidFields,
    buildFieldStateOnFocus,
    handleFetchError,
    updateModelFieldsWithDbValues,
    initializeChangeFormFieldState,
    initializeAddFormFieldState,
    helpTextPrefix,
    handleOnFocus,
  }
}


