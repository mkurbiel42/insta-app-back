import { IncomingMessage } from "http";
import { areMatchingPasswords, createToken, decodeToken, decodeTokenString, encryptPassword, verifyToken } from "../globals";
import { setUsersList, User, UserLoginData, UserRegisterData, usersList } from "../model";

export async function register(userData: UserRegisterData): Promise<{status: number, data?: User, error?: string, token?: string}>{
    let {firstName, lastName, email, password, username} = userData;

    if(!firstName || !lastName || !email || !password || !username){
        return {status: 409, error: "Missing user data"}
    }

    if(usersList.find((u: User) => u.email === email || u.username == username)){
        return {status: 400, error: "User already exists"}
    }

    let newUser: User = {
        id: Date.now(),
        username,
        firstName,
        lastName,
        email,
        passwordEnc: await encryptPassword(password),
        confirmed: false
    }

    setUsersList([...usersList, newUser])

    let token = createToken(newUser, "60min")
    // verifyToken(createToken(newUser))

    return {status: 201, data: newUser, token}
}

export async function login(userData: UserLoginData): Promise<{token?: string, error?: string}>{
    let {email, password} = userData;

    let user = usersList.find((u: User) => (u.email === email || u.username === email))

    if(!user) return {error: "User doesn't exist"};
    if(!user.confirmed) return {error: "User needs to be confirmed"}
    if(!await areMatchingPasswords(password, user.passwordEnc)) return {error: "Passwords don't match"}

    return {token: createToken(user, null)};
}

export function confirmRegister(token: string){
    let tokenData = decodeTokenString(token)

    let user = usersList.find((u: User) => u.id == tokenData.payload.id!)

    if(user && user.confirmed === false){
        user.confirmed = true
        return true
    }else{
        return false
    }
}