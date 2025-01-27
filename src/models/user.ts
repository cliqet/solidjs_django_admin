export type PermActions = 'add' | 'view' | 'change' | 'delete';

export type UserPermissionsType = {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        id: number;
        perms: {
          [key: string] : number;
        }
        perms_ids: {
          [key: string]: PermActions;
        }
      }
    }
  }
}

export type User = {
  exp : number;
  iat : number;
  jti : string;
  uid: string;
  first_name : string;
  last_name : string;
  email : string;
  is_superuser: boolean;
  is_staff : boolean;
  is_active : boolean;
  initials : string;
  session_id: string;
}


export interface Permission {
  id: number;
  name: string;
  contentTypeId: number;
  codename: string;
}

export interface Group {
  id: number;
  name: string;
  permissionIds: number[];
}
