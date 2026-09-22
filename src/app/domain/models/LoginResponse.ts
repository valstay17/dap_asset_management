export interface LoginResponse {
  token: string;
  user: {
    idUser: number;
    mail: string;
    profile: {
      idProfile: number;
      name: string;
      active: boolean;
    };
    active: boolean;
  };
}