import { discord, discordCanary } from "./discord";

export interface CacheItem {
	blob: Blob;
	type: string;
}
export class CacheLocation {
	constructor(public name: string, public scanForItems: (cDrive: FileSystemDirectoryHandle) => Promise<CacheItem[]>) {

	}
}
export const cacheLocations = [
	discord,
	discordCanary
]