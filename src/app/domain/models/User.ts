export type UserStatus = 'activo' | 'inactivo';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  entityId: string;
  entity: string;
  locationId: string;
  location: string;
  status: UserStatus;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  entityId: string;
  locationId: string;
}
