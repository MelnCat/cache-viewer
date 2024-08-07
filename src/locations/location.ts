import { FileTypeResult } from "file-type";
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
	blob: Blob;
}
export class CacheLocation {
	constructor(public name: string, protected scan: (cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]) => Promise<UnprocessedCacheItem[] | undefined>) {}

	async scanForItems(cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[], onUpdate: (current: number, max: number) => void): Promise<CacheItem[] | undefined> {
		const items = await this.scan(cDrive, users);
		if (!items) return;
		let done = 0;
		return (
			(await Promise.all(
				items.map(async x => {
					try {
						const type = await fileType(x.file);
						onUpdate(++done, items.length);
						return { ...x, type, url: URL.createObjectURL(x.file), blob: x.file };
					} catch {
						return { ...x, type: undefined, url: "", blob: x.file }
					}
				}).map(x => Promise.race([x, new Promise(res => setTimeout(() => res(null), 30000))]) as Promise<CacheItem | null>)
			)).filter(x => x !== null)
		).sort((a, b) => b.file.lastModified - a.file.lastModified);
	}
}
