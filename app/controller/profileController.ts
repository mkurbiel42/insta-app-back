import path = require("path");
import {HttpNormal, User, usersList} from "../model";
import * as fs from "fs";
import * as forms from "formidable";
import { decodeToken, mainDir } from "../globals";

const uploadsPath = `${mainDir}/uploads/pfps`;

export function parsePfpUploadForm(norm: HttpNormal) {
	let {req, res} = norm;

	return new Promise<User>((resolve, reject) => {
        let decoded = decodeToken(req)

        let userId : number = decoded.payload.id;
        let user: User = usersList.find((u: User) => u.id === userId)

		if (!fs.existsSync("uploads")) {
            fs.mkdirSync("uploads");
        }
        if (!fs.existsSync("uploads/pfps")) {
            fs.mkdirSync("uploads/pfps");
        }
        if (!fs.existsSync(`uploads/pfps/${userId}`)) {
            fs.mkdirSync(`uploads/pfps/${userId}`);
        }

		const form = forms({ multiples: true, uploadDir: __dirname = `uploads/pfps/${userId}`, keepExtensions: true });
        
        
		form
            .on("file", (name, file) => {
				if(user){
					user.pfpUrl = file.path.replaceAll("\\", "/")
				}
			})

			.parse(req, (err, fields, files) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(user);
			});
	});
}