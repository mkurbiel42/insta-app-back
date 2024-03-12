import { handle404, parseFormFields, sendResponse, verifyToken } from "../globals"
import { HttpNormal, Tag, TagInfo, tagsList, User, UserLoginData, UserRegisterData, usersList } from "../model"
import { addTag, getTagInfo } from "../controller/tagsController"
import { confirmRegister, login, register } from "../controller/usersController"

export async function route(norm: HttpNormal){
	let {req, res} = norm
    if (req.url == "/api/users/register" && req.method == "POST") {
		registerUser({req, res})
	} else if (req.url!.match(/\/api\/users\/confirm\/([0-9a-zA-Z.-]+)/) && req.method == "GET") {
        confirmUserRegister({req,res})
	} else if (req.url == "/api/users/login" && req.method == "POST") {
        loginUser({req, res})
    }else if(req.url == "/api/users/auth" && req.method == "GET"){
        authorizeUser({req, res})
	} else if (req.url == "/api/users" && req.method == "GET") {
        getAllUsers({req, res})
	} else {
		handle404(res)
	}
}

export async function registerUser(norm: HttpNormal){
    let {req, res} = norm;

    let fields = await parseFormFields(req, res) as UserRegisterData
    let newUser = await register(fields)

    if(!newUser.error){
        sendResponse(res, newUser.status, "application/json", JSON.stringify({"message": `Potwierdź rejestrację pod adresem: http://${process.env.SERVER_ADDRESS}/api/users/confirm/${newUser.token}\n Link wygasa za godzinę.`}))
    }else{
        sendResponse(res, newUser.status, "application/json", JSON.stringify({error: newUser.error}))
    }   
}

export async function confirmUserRegister(norm: HttpNormal){
    let {req, res} = norm;

    let urlParts = req.url.split("/")
    let token = urlParts[urlParts.length - 1]

    if(verifyToken(token)){
        if(confirmRegister(token)){
            sendResponse(res, 200, "application/json", JSON.stringify({state: "User confirmed"}))
        }else{
            sendResponse(res, 400, "application/json", JSON.stringify({state: "User already confirmed"}))
        }
        
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({error: "The link has already expired"}))
    }
}

export async function loginUser(norm: HttpNormal){
    let {req, res} = norm;

    let userData: UserLoginData = await parseFormFields(req, res) as UserLoginData;
    let {error, token} = await login(userData);
    
    if(!error){
        sendResponse(res, 201, "application/json", JSON.stringify({"token": token}))
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({"error": error}))
    }
}

export async function authorizeUser(norm: HttpNormal){
    let {req, res} = norm;

    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        sendResponse(res, 401, "application/json", JSON.stringify({"error": "No authorization header"}))
    }

    let token = req.headers.authorization.split(" ")[1]

    if(verifyToken(token)){
        sendResponse(res, 200, "application/json", JSON.stringify({"authorized": true}))
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({"authorized": false}))
    }
}

export async function getAllUsers(norm: HttpNormal){
    let {req, res} = norm;

    sendResponse(res, 200, "application/json", JSON.stringify(usersList))
}