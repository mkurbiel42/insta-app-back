import * as http from "http";
import * as fs from "fs"
import * as filesRouter from "./app/router/filesRouter";
import * as tagsRouter from "./app/router/tagsRouter"
import * as filtersRouter from "./app/router/filtersRouter"
import * as profileRouter from "./app/router/profileRouter"
import * as usersRouter from "./app/router/usersRouter"
import * as dotenv from "dotenv"
import { decodeToken, handle404, sendResponse } from "./app/globals";
dotenv.config()

const mimeTypes = {
	"txt": "text/plain",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
	"mp4": "video/mp4",
	"png": "image/png",
}

const unauthorizedURLs = [
	"/uploads",
	"/api/users/login",
	"/api/users/register",
	"/api/users/confirm",
	"/api/profile/pfp"
]

const needsAuthorization = (reqUrl: string) => {
	for(let url of unauthorizedURLs){
		if(reqUrl.search(url) != -1) return false
	}

	return true
}

const server = http.createServer(async (req, res) => {
	console.log(req.url)

	if(needsAuthorization(req.url)){
		if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
			sendResponse(res, 409, "application/json", JSON.stringify({"error": "No authorization header"}))
			return
		}
		
		let decoded = decodeToken(req)
		console.log(decoded.payload);
	
		if(decoded.state !== "valid"){
			sendResponse(res, 409, "application/json", JSON.stringify({"error": decoded.error}))
			return
		}
	}

    if (req.url.search("/api/photos") != -1) {
		await filesRouter.route({req, res})
	 }
 
	 else if (req.url.search("/api/tags") != -1) {
		await tagsRouter.route({req, res})
	 }

	 else if(req.url.search("/api/filters") != -1) {
		await filtersRouter.route({req, res})
	 }

	 else if(req.url.search("/api/users") != -1){
		await usersRouter.route({req, res})
	 }

	 else if(req.url.search("/api/profile") != -1){
		await profileRouter.route({req, res})
	 }

 	else if(req.url.search("/uploads") != -1){
		try {
			const extension = req.url.split(".")[req.url.split(".").length - 1]
			const data = fs.readFileSync(req.url.substring(1));
			sendResponse(res, 200, mimeTypes[extension], data)
		  } catch (err) {
			handle404(res)
		  }	
	 }

	 else{
		handle404(res)
	 }
});

server.listen(process.env.PORT, () => {
	console.log(`Server working on ${process.env.PORT}`);
});
