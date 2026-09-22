export interface AuthSession {
    token: string;
    user: {
        idUser: string;
        name: string;
        mail: string;
    }
}