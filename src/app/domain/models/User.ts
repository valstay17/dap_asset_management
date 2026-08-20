export type UserStatus = 'activo' | 'inactivo';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  entity: string;
  department: string;
  location: string;
  status: UserStatus;
}

export type NewUser = Pick<User, 'firstName' | 'lastName' | 'entity' | 'department' | 'location'>;
