import * as http from "http"

export interface Photo {
	id: number;
	album: string;
	originalName: string;
	url: string;
	originalUrl: string;
	lastChange: string;
	history: PhotoHistoryEntry[];
	tags: Tag[],
	place: Place,
	public: boolean,
	isVideo: boolean
}

export interface FileInfo {
	id: number;
	album: string;
	originalName: string;
	url: string;
	originalUrl: string;
}

export interface PhotoHistoryEntry {
	status: string;
	timestamp: number;
	url?: string;
}

export interface PhotoInfo {
	id: number,
	tags?: string,
	place?: Place
}

export interface Tag{
	id: number;
	name: string;
	popularity: number
}

export interface TagInfo{
	name: string;
	popularity: number;
}

export interface HttpNormal{
	req: http.IncomingMessage, 
	res: http.ServerResponse<http.IncomingMessage>
}

export interface ColorRGB{
	r: number,
	g: number,
	b: number
}

export interface CropData{
	width: number,
	height: number,
	left: number,
	top: number
}

export interface FilterData{
	color?: ColorRGB,
	crop?: CropData,
	rotation?: number,
	format?: string
}

export interface Filter{
	id: number,
	filterType: string,
	filterData: FilterData
}

export interface UserRegisterData{
	firstName: string,
	lastName: string,
	username: string,
	email: string,
	password: string
}

export interface UserLoginData{
	email: string,
	password: string
}

export interface User{
	id: number,
	username: string,
	firstName: string,
	lastName: string,
	email: string,
	passwordEnc: string,
	confirmed: boolean,
	pfpUrl?: string
}

export interface Place{
	name: string;
	description: string;
	lat: number;
	lng: number;
}

export enum FilterTypes{
	ROTATE = "rotate",
	CROP = "crop",
	NEGATE = "negate",
	FLIP = "flip",
	FLOP = "flop",
	GRAYSCALE = "grayscale",
	RESIZE = "resize",
	TINT = "tint",
	REFORMAT = "reformat"
}


export let photosList: Photo[] = [];
export let setPhotosList = (newPhotosList: Photo[]): void => {
	photosList = [...newPhotosList];
};

export let tagsList : Tag[] = [
	{
		 "id": 0,
		 "name": "#love",
		 "popularity": 242
	},
	{
		 "id": 1,
		 "name": "#instagood",
		 "popularity": 433
	},
	{
		 "id": 2,
		 "name": "#fashion",
		 "popularity": 195
	},
	{
		 "id": 3,
		 "name": "#photooftheday",
		 "popularity": 215
	},
	{
		 "id": 4,
		 "name": "#beautiful",
		 "popularity": 828
	},
	{
		 "id": 5,
		 "name": "#art",
		 "popularity": 109
	}
]

export let setTagsList = (newTagsList: Tag[]): void => {
	tagsList = [...newTagsList]
}

export let usersList: User[] = []

export let setUsersList = (newUsersList: User[]): void => {
	usersList = [...newUsersList]
} 