import { areMatchingPasswords, decodeToken, encryptPassword, handle404, parseFormFields, sendResponse } from "../globals"
import { HttpNormal, User, usersList } from "../model"
import { parsePfpUploadForm } from "../controller/profileController"
import { getAllUsers } from "./usersRouter"
import * as fs from "fs"

export async function route(norm: HttpNormal){
	let {req, res} = norm
    if (req.url == "/api/profile" && req.method == "GET") {
	    getProfileData({req, res})
	} else if (req.url == "/api/profile" && req.method == "PATCH") {
        patchProfileData({req,res})
	} else if (req.url == "/api/profile" && req.method == "POST") {
        postProfilePicture({req, res})
    } else if (req.url!.match(/\/api\/profile\/username\/([0-9]+)/) && req.method == "GET") {
        getUsername({req, res})
    }
    else if (req.url!.match(/\/api\/profile\/pfp\/([0-9]+)/) && req.method == "GET") {
        getProfilePicture({req, res})
	} else {
        handle404(res)
	}
}

async function getProfileData(norm: HttpNormal){
    let {req, res} = norm;

    let decoded = decodeToken(req)

    let user: User = usersList.find((u: User) => u.id == decoded.payload.id)

    if(user){
        sendResponse(res, 200, "application/json", JSON.stringify({firstName: user.firstName, username: user.username, lastName: user.lastName, email: user.email, pfpUrl: user.pfpUrl}))
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({error: "User does not exist"}))
    }
    
   
}

async function patchProfileData(norm: HttpNormal){
    let {req, res} = norm
    let fields: any = await parseFormFields(req, res)

    let decoded = decodeToken(req)

    let user: User = usersList.find((u: User) => u.id == decoded.payload.id)

    user.firstName = fields.firstName ?? user.firstName
    user.lastName = fields.lastName ?? user.lastName
    if(fields.oldPassword && fields.password){
        if(await areMatchingPasswords(fields.oldPassword, user.passwordEnc)){
            user.passwordEnc = await encryptPassword(fields.password);
        }else{
            sendResponse(res, 400, "application/json", JSON.stringify({error: "Invalid password"}))
            return
        }
    }

    if(fields.username === "" || !fields.username){
        sendResponse(res, 400, "application/json", JSON.stringify({error: "Username can not be empty"}))
        return
    }
    if(!usersList.find(u => u.username == fields.username && u.id != decoded.payload.id)){
        user.username = fields.username
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({error: "Username already taken"}))
        return
    }
    console.log(user)
    
    

    sendResponse(res, 200, "application/json", JSON.stringify({firstName: user.firstName, username: user.username, lastName: user.lastName, email: user.email, pfpUrl: user.pfpUrl}))
}

async function postProfilePicture(norm: HttpNormal){
    let {req, res} = norm
    let user: User = await parsePfpUploadForm({req, res})
    if(user){
        sendResponse(res, 200, "application/json", JSON.stringify({pfpUrl: user.pfpUrl}))
    }else{
        sendResponse(res, 400, "application/json", JSON.stringify({error: "User doesn't exist"}))
    }
}

async function getProfilePicture(norm: HttpNormal){
    let {req, res} = norm
    let id = parseInt(req.url!.substring(req.url!.lastIndexOf("/") + 1));
    let user: User = usersList.find(u => u.id == id);

    if (user && user.pfpUrl) {
        const data = fs.readFileSync(user.pfpUrl);
        sendResponse(res, 200, "image/jpeg", data)
    } else {
        sendResponse(res, 400, "application/json", JSON.stringify({ error: "This user does not have a profile picture" }));
    }
}

async function getUsername(norm: HttpNormal){
    let {req, res} = norm;
    let id = parseInt(req.url!.substring(req.url!.lastIndexOf("/") + 1));
    let user: User = usersList.find(u => u.id == id);

    if (user) {
        sendResponse(res, 200, "application/json", JSON.stringify(user.username))
    } else {
        sendResponse(res, 400, "application/json", JSON.stringify({error: "no such user"}))
    }
}