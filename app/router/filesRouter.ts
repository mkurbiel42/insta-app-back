import * as http from "http";
import * as forms from "formidable";
import * as path from "path";
import * as fs from "fs"
import { FileInfo, HttpNormal, Photo, PhotoInfo, photosList, Place, setPhotosList, Tag, tagsList } from "../model";
import { addTags, addToPhotoHistory, getFile, getFileInfo, getFilesList, parseUploadForm } from "../controller/filesController";
import { mainDir, sendResponse, parseFormFields, handle404, decodeToken } from "../globals";
import { getTagInfo, getTagInfoByName } from "../controller/tagsController";

export async function route(norm: HttpNormal) {
	let {req, res} = norm;

	if (req.url == "/api/photos" && req.method == "POST") {
		postPhoto({req, res})
	} else if (req.url == "/api/photos" && req.method == "GET") {
		getPhotos({req, res})
	} else if (req.url == "/api/photos/user") {
		getUserPhotos({req, res})
	}else if (req.url.match(/\/api\/photos\/([0-9]+)/) && req.method == "GET") {
		getPhoto({req, res})
	} else if (req.url.match(/\/api\/photos\/([0-9]+)/) && req.method == "DELETE") {
		deletePhoto({req, res})
	} else if (req.url == "/api/photos" && req.method == "PATCH") {
		patchPhoto({req, res})
	} else if(req.url == "/api/photos/tags" && req.method == "PATCH"){
		tagPhoto({req, res})
	} else if(req.url == "/api/photos/tags/mass" && req.method == "PATCH"){
		tagPhotoMass({req, res})
	} else if(req.url.match(/\/api\/photos\/getFile\/([0-9]+)/) && req.method == "GET") {
		getPhotoFile({req, res})
	}
	else {
		handle404(res)
	}
}

async function postPhoto(norm: HttpNormal){
	let {req, res} = norm;
	sendResponse(res, 201, "application/json", JSON.stringify(await parseUploadForm({req, res})));
}

async function getPhotos(norm: HttpNormal){
	let {req, res} = norm;
	sendResponse(res, 200, "application/json", JSON.stringify(getFilesList().sort((a,b) => b.id - a.id)));
}

async function getUserPhotos(norm: HttpNormal){
	let {req, res} = norm;
	let decoded = decodeToken(req)
	sendResponse(res, 200, "application/json", JSON.stringify(getFilesList().sort((a,b) => b.id - a.id).filter((p: Photo) => p.album === decoded.payload.id.toString())));
}

async function getPhoto(norm: HttpNormal){
	let {req, res} = norm;
	let id = parseInt(req.url.substring(req.url.lastIndexOf("/") + 1));
		let photo: Photo = getFileInfo(id);

		if (photo) {
			sendResponse(res, 200, "application/json", JSON.stringify(photo));
		} else {
			sendResponse(res, 400, "application/json", JSON.stringify({ error: "No such photo" }));
		}
}

async function deletePhoto(norm: HttpNormal){
	let {req, res} = norm;
	let id = parseInt(req.url.substring(req.url.lastIndexOf("/") + 1));
		let photo: Photo = getFileInfo(id);

		setPhotosList(photosList.filter((p: Photo) => p !== photo));

		if (photo) {
			fs.rm(path.join(mainDir, photo.url), () => {
				sendResponse(res, 200, "application/json", JSON.stringify({ success: `deleted photo with id ${photo.id}` }));
			})
		} else {
			sendResponse(res, 400, "application/json", JSON.stringify({ error: `No such photo with id ${id}` }));
		}
}

async function patchPhoto(norm: HttpNormal){
	let {req, res} = norm;
	let data: PhotoInfo = await parseFormFields(req, res) as PhotoInfo
	console.log("data", data)

	let photo: Photo = getFileInfo(data.id)

	if(!photo){
		sendResponse(res, 400, "application/json", JSON.stringify({error: "photo doesn't exist"}))
		return
	}

	let tags = [...tagsList.filter((t: Tag) => data.tags.includes(t.name))]

	console.log(photo, tags, data.place)
	addTags(photo, ...tags)
	photo.place = data.place;
	photo.public = true
	
	sendResponse(res, 201, "application/json", JSON.stringify(photo))
}

async function tagPhoto(norm: HttpNormal){
	let {req, res} = norm;
	let newTag = await parseFormFields(req, res)
	let id: number = newTag["id"] as number
	let tagName: string = newTag["tagName"] as string

	let photo: Photo = getFileInfo(id)
	let tag: Tag = getTagInfoByName(tagName)

	if(photo && tag){
		addTags(photo, tag)
		sendResponse(res, 200, "application/json", JSON.stringify(photo))
	}else{
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `Can't patch photo ${id} - no such photo or tag`}))
	}
}

async function tagPhotoMass(norm: HttpNormal){
	let {req, res} = norm;
	let newTags = await parseFormFields(req, res)
	let id: number = newTags["id"] as number
	let tagNames: string[] = newTags["tagNames"] as string[]

	let photo: Photo = getFileInfo(id)
	let tags = [...tagsList.filter((t: Tag) => tagNames.includes(t.name))]

	if(photo){
		addTags(photo, ...tags)
		sendResponse(res, 200, "application/json", JSON.stringify(photo))
	}else{
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `Can't patch photo ${id} - no such photo`}))
	}
}

async function getPhotoFile(norm: HttpNormal){
	let {req, res} = norm;

	let urlParts = req.url.split("/")
	let id: number = parseInt(urlParts[urlParts.length - 1])
	let photo: Photo = getFileInfo(id)
	
	if(!photo){
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `Can't find photo with id ${id}`}))
		return
	}

	let request = await getFile(photo.url)
	let data = request["data"]

	if(!request["error"]){
		sendResponse(res, 200, "image/jpeg", data)
	}else{
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `Can't find photo with id ${id}`}))
	}
}