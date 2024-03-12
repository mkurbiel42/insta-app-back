import { setTagsList, Tag, TagInfo, tagsList } from "../model";

export function getFilesList(): Tag[] {
	return tagsList;
}

export function getTagInfo(id: number): Tag {
	return tagsList.find((t: Tag) => t.id === id)!;
}

export function getTagInfoByName(name: string): Tag {
	return tagsList.find((t: Tag) => t.name === name)!;
}

export function addTag(newTagInfo: TagInfo): {state: number, response: string} {
	let state:number = 201
	let response:string = "";
	let existingTag = tagsList.find((t:Tag) => t.name == newTagInfo.name)

	if(newTagInfo.name[0] != "#"){
		state = 400;
		response = JSON.stringify({"error": "tag must start with a # sign"})
	}
	else if(existingTag){
		state = 200;
		response = JSON.stringify(existingTag)
	}else{
		let newTag: Tag = {...newTagInfo, id: tagsList.length}
		setTagsList([...tagsList, newTag])
		state = 200
		response = JSON.stringify(newTag)
	}
	

	return {state, response}
}
