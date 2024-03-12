import * as http from "http"
import * as sharp from "sharp"
import { handle404, parseFormFields, sendResponse } from "../globals";
import {Filter, FilterData, FilterTypes, HttpNormal, Photo, PhotoHistoryEntry} from "../model"
import { applyFilter, getMetadata } from "../controller/filtersController";
import { addToPhotoHistory, getFileInfo } from "../controller/filesController";

export async function route(norm: HttpNormal){
	let {req, res} = norm;

    if(req.url.match(/\/api\/filters\/metadata\/([0-9]+)/) && req.method == "GET"){
		sendMetadata({req, res})
	} else if(req.url == "/api/filters" && req.method == "PATCH"){
		filterPhoto({req, res})
	}
	else {
		handle404(res)
	}
}

async function sendMetadata(norm: HttpNormal){
	let {req, res} = norm
	
	let urlParts = req.url.split("/")
	let id: number = parseInt(urlParts[urlParts.length - 1])
	let photo: Photo = getFileInfo(id)
	
	if(photo){
		let url = "." + photo.originalUrl
		let metadata : sharp.Metadata = await getMetadata(url) as sharp.Metadata
		sendResponse(res, 200, "application/json", JSON.stringify({width: metadata.width, height: metadata.height}))
	}else{
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `Couldn't get metadata of photo ${id} - no such photo`}))
	}
}

async function filterPhoto(norm: HttpNormal){
	let {req, res} = norm;

	let fields = await parseFormFields(req, res) as Filter;

	let filterType: string = fields.filterType
	let id: number = fields.id
	let photo: Photo = getFileInfo(id)

	if(photo){
		console.log(photo)
		let url = photo.originalUrl
		let [name, extension] : string[] = photo.originalUrl.split(".")

		if(filterType == "reformat"){
			extension = fields.filterData.format
		}

		if(filterType === "original"){
			photo.url = photo.originalUrl
			photo.lastChange = "original"
			sendResponse(res, 200, "application/json", JSON.stringify({photo}))
			return
		}
		
		let i = 1 + photo.history.filter((e: PhotoHistoryEntry) => e.status.indexOf(filterType) != -1).length;
		let newUrl = `${name}-${filterType}-${i}.${extension}`
		console.log(newUrl)

		let output: any = await applyFilter(filterType as FilterTypes, fields.filterData, `${url}`, `${newUrl}`)
		
		console.log(output)
		if(!output.error){
			addToPhotoHistory(photo, `${fields.filterType}-${i}`, newUrl)
			photo.url = newUrl
			console.log(photo)
			sendResponse(res, 200, "application/json", JSON.stringify(photo))
		}else{
			let {error} = output as {error:string}
			sendResponse(res, 400, "application/json", JSON.stringify({error}))
		}

		
	}else{
		sendResponse(res, 400, "application/json", JSON.stringify({"error": `No such photo with id ${id}`}))
	}
}