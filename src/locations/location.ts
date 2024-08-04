import { fileTypeFromBlob, FileTypeResult } from "file-type";
import { decompress } from "wasm-gzip";
import { fileType } from "../util/util";

export interface UnprocessedCacheItem {
	id: string;
	file: File;
}

export interface CacheItem {
	id: string;
	type: FileTypeResult | undefined;
	url: string;
	file: File;
}
export class CacheLocation {
	constructor(public name: string, protected scan: (cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]) => Promise<UnprocessedCacheItem[] | undefined>) {}

	async scanForItems(cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[], onUpdate: (current: number, max: number) => void): Promise<CacheItem[] | undefined> {
		const items = await this.scan(cDrive, users);
		if (!items) return;
		let done = 0;
		return (
			await Promise.all(
				items.map(async x => {
					let timeout = setTimeout(() => console.log(x.file, "takin ga while"), 10000);
					const type = await fileType(x.file);
					clearTimeout(timeout);
					if (type?.mime === "application/gzip" && x.file.size < 10000000) {
						const newBlob = new Blob([decompress(new Uint8Array(await x.file.arrayBuffer()))]);
						const newType = await fileType(newBlob);
						onUpdate(++done, items.length);
						return { ...x, type: newType, blob: newBlob, url: URL.createObjectURL(newBlob) };
					}
					onUpdate(++done, items.length);
					return { ...x, type, url: URL.createObjectURL(x.file) };
				})
			)
		).sort((a, b) => b.file.lastModified - a.file.lastModified);
	}
}
