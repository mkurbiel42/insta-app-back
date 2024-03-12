import * as http from "http"
import * as forms from "formidable"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { User } from "./model";

export let mainDir: string = __dirname.substring(0, __dirname.length - 4);

export function sendResponse(res: http.ServerResponse<http.IncomingMessage>, status: number, contentType: string, data: any) {
	res.writeHead(status, { "Content-Type": contentType });
	res.write(data);
	res.end();
}

export function handle404(res: http.ServerResponse<http.IncomingMessage>){
	sendResponse(res, 404, "text/html", "<h1>404 - No such page</h1>")
}

export function parseFormFields(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>){
	return new Promise((resolve, reject) => {
		const form = forms();
		form.parse(req, (err, fields, files) => {
				if (err) {
					reject(err);
				}
				resolve(fields);
			});
	})
}

export async function encryptPassword(password: string): Promise<string>{
	let encryptedPassword : string = await bcrypt.hash(password, 10)
	return encryptedPassword
}

export async function areMatchingPasswords(password: string, encrypted: string): Promise<boolean>{
	return await bcrypt.compare(password, encrypted)
}

export function createToken(user: User, time: string): string{
	let payload = {
		id: user.id,
		email: user.email,
		// firstName: user.firstName,
		// lastName: user.lastName,
	}

	let signOptions : jwt.SignOptions = {}

	if(time){
		signOptions.expiresIn = time
	}

	let token: string = jwt.sign(payload, process.env.JWT_KEY, signOptions)

	return token
}	


export function verifyToken(token: string): boolean{
	try{
		let decoded = jwt.verify(token, process.env.JWT_KEY)
		return true
	}catch(ex){
		return false
	}
}

export function decodeToken(req: http.IncomingMessage): {state: string, payload?: jwt.JwtPayload, error?: string}{
	console.log(req.headers.authorization)
	let token = req.headers.authorization.split(" ")[1]
	try{
		let decoded = jwt.verify(token, process.env.JWT_KEY) as jwt.JwtPayload
		return {state: "valid", payload: decoded}
	}catch(ex){
		return {state: "error", error: ex.message}
	}
}

export function decodeTokenString(token: string): {state: string, payload?: jwt.JwtPayload, error?: string}{
	try{
		let decoded = jwt.verify(token, process.env.JWT_KEY) as jwt.JwtPayload
		return {state: "valid", payload: decoded}
	}catch(ex){
		return {state: "error", error: ex.message}
	}
}