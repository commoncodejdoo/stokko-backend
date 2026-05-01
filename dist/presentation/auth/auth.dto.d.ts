export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class ForcedPasswordChangeDto {
    passwordChangeToken: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
