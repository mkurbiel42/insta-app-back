import * as http from "http"
import * as forms from "formidable";
import { handle404, parseFormFields, sendResponse } from "../globals"
import { HttpNormal, Tag, TagInfo, tagsList } from "../model"
import { addTag, getTagInfo } from "../controller/tagsController"

export async function route(norm: HttpNormal){
	let {req, res} = norm
    if (req.url == "/api/tags" && req.method == "POST") {
		postTag({req, res})
	} else if (req.url == "/api/tags/raw" && req.method == "GET") {
		getTagsRaw({req, res})
	} else if (req.url == "/api/tags" && req.method == "GET") {
		getTags({req, res})
    } else if (req.url!.match(/\/api\/tags\/([0-9]+)/) && req.method == "GET") {
        getTag({req, res})
	} else {
		handle404(res)
	}
}

async function postTag(norm: HttpNormal){
	let {req, res} = norm
    let fields = await parseFormFields(req, res)
	let {state, response}: {state: number, response: string} = addTag(fields as TagInfo)
	sendResponse(res, state, "application/json", JSON.stringify(JSON.parse(response)))
}

async function getTagsRaw(norm: HttpNormal){
	let {req, res} = norm
    sendResponse(res, 200, "application/json", JSON.stringify(tagsList.map((t: Tag) => (t.name))))
}

async function getTags(norm: HttpNormal){
	let {req, res} = norm
    sendResponse(res, 200, "application/json", JSON.stringify(tagsList))
}

async function getTag(norm: HttpNormal){
	let {req, res} = norm
    let id = parseInt(req.url!.substring(req.url!.lastIndexOf("/") + 1));
		let tag: Tag = getTagInfo(id);

		if (tag) {
			sendResponse(res, 200, "application/json", JSON.stringify(tag));
		} else {
			sendResponse(res, 400, "application/json", JSON.stringify({ error: "No such tag" }));
		}
}