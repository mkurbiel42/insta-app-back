import * as sharp from "sharp"
import { FilterData, FilterTypes } from "../model"

export async function getMetadata(url: string){
	return new Promise(async (resolve, reject) => {
		try {
			let meta = await sharp(url)
					.metadata()
			resolve(meta)
		} catch (err) {
			reject(err)
		}
	})
}

export async function applyFilter(filterType: FilterTypes, filterData: FilterData, url: string, newUrl: string){
	return new Promise<{error: string}|sharp.OutputInfo>(async (resolve, reject) => {
		try{
			let outputData: {error: string}|sharp.OutputInfo;

			switch(filterType){
				case "rotate":
					outputData = await sharp(url)
						.rotate(filterData.rotation)
						.toFile(newUrl)
					break

				case "crop":
					outputData = await sharp(url)
						.extract(filterData.crop)
						.toFile(newUrl)
					break

				case "negate":
				outputData = await sharp(url)
					.negate()
					.toFile(newUrl)
				break

				case "flip":
					outputData = await sharp(url)
						.flip()
						.toFile(newUrl)
					break

				case "flop":
					outputData = await sharp(url)
						.flop()
						.toFile(newUrl)
					break

				case "grayscale":
					outputData = await sharp(url)
						.grayscale()
						.toFile(newUrl)
					break

				case "resize":
					outputData = await sharp(url)
						.resize(filterData.crop as {width: number, height: number})
						.toFile(newUrl)
					break

				case "tint":
					outputData = await sharp(url)
						.tint(filterData.color)
						.toFile(newUrl)
					break

				case "reformat":
					outputData = await sharp(url)
						.toFormat(filterData.format as keyof sharp.FormatEnum)
						.toFile(newUrl)
					break

				default:
					outputData = {error: `filter of type '${filterType}' not found`}
			}

			resolve(outputData)
		}catch(err){
			resolve(err)
		}
	})
}