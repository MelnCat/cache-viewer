import { fileTypeFromBlob, FileTypeResult } from "file-type";
import { discord, discordCanary } from "./discord";

export interface UnprocessedCacheItem {
	blob: Blob;
}

export interface CacheItem {
	blob: Blob;
	type: FileTypeResult | undefined;
	text: string;
	url: string;
}
export class CacheLocation {
	constructor(public name: string, protected scan: (cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]) => Promise<UnprocessedCacheItem[] | undefined>) {}

	async scanForItems(cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]): Promise<CacheItem[] | undefined> {
		const items = await this.scan(cDrive, users);
		if (!items) return;
		return (await Promise.all(items.map(async x => ({ ...x, type: await fileTypeFromBlob(x.blob), text: "A", url: URL.createObjectURL(x.blob) }))))
	}
}
