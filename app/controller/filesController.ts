import path = require("path");
import { FileInfo, HttpNormal, Photo, PhotoHistoryEntry, photosList, Place, Tag } from "../model";
import * as fs from "fs";
import * as forms from "formidable";
import { decodeToken, mainDir } from "../globals";

const uploadsPath = `${mainDir}/uploads/albums`;

export function getFilesList() {
	return photosList.filter((p:Photo) => p.public);
}

export function getFileInfo(id: number) {
	return photosList.find((p: Photo) => p.id === id);
}

export function addToPhotoHistory(photo: Photo, status: string, url?: string) : boolean{
	photo.history.push({status, timestamp: Date.now(), url})
	photo.lastChange = status

	return true
}

export function addTags(photo: Photo, ...tags: Tag[]){
	photo.tags = [...tags]
}

export function parseUploadForm(norm: HttpNormal) {
	let {req, res} = norm;
	let userId = decodeToken(req).payload.id

	if (!fs.existsSync("uploads")) {
		fs.mkdirSync("uploads");
	}
	if (!fs.existsSync("uploads/albums")) {
		fs.mkdirSync("uploads/albums");
	}
	if (!fs.existsSync(`uploads/albums/${userId}`)) {
		fs.mkdirSync(`uploads/albums/${userId}`);
	}

	return new Promise((resolve, reject) => {
		const form = forms({ multiples: true, uploadDir: `uploads/albums/${userId}`, keepExtensions: true });
		let place: Place;

		form
			.on("field", (name, value) => {
				if(name === "place"){
					place = JSON.parse(value)
				}
			})

			.on("file", (name, file) => {
				let timestamp = Date.now();

				let newFile: FileInfo = {
					id: timestamp,
					album: userId.toString(),
					originalName: file.name,
					url: file.path.replaceAll("\\", "/"),
					originalUrl: file.path.replaceAll("\\", "/"),
				};

				photosList.push({
					...newFile,
					history: [{ status: "original", timestamp, url: file.path.replaceAll("\\", "/")}],
					lastChange: "original",
					tags: [],
					place: null,
					public: false,
					isVideo: (file.path.split(".")[file.path.split(".").length - 1] == "mp4")
				});
			})

			.parse(req, (err, fields, files) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(photosList[photosList.length - 1]);
			});
	});
}

export const getFile = async (url: string) => {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile("." + url, (error, data) => {
				if (error) {
					resolve({ state: "error", error });
				} else {
					resolve({ state: "success", data });
				}
			});
		} catch (err) {
			reject(err);
		}
	});
};
