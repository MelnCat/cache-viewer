import { decompress, decompressSync } from "fflate";
import { fileTypeFromBlob, FileTypeResult } from "file-type";

export interface UnprocessedCacheItem {
	id: string;
	blob: Blob;
	file: File;
}

export interface CacheItem {
	id: string;
	blob: Blob;
	type: FileTypeResult | undefined;
	url: string;
	file: File;
}
export class CacheLocation {
	constructor(public name: string, protected scan: (cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]) => Promise<UnprocessedCacheItem[] | undefined>) {}

	async scanForItems(cDrive: FileSystemDirectoryHandle, users: FileSystemDirectoryHandle[]): Promise<CacheItem[] | undefined> {
		const items = await this.scan(cDrive, users);
		if (!items) return;
		return (
			await Promise.all(
				items.map(async x => {
					const type = await fileTypeFromBlob(x.blob);
					if (type?.mime === "application/gzip") {
						const newBlob = new Blob([decompressSync(new Uint8Array(await x.blob.arrayBuffer()))]);
						return { ...x, type: await fileTypeFromBlob(newBlob), blob: newBlob, url: URL.createObjectURL(newBlob) };
					}
					return { ...x, type: await fileTypeFromBlob(x.blob), url: URL.createObjectURL(x.blob) };
				})
			)
		).sort((a, b) => b.file.lastModified - a.file.lastModified);
	}
}
