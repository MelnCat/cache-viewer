import { fileTypeFromBuffer } from "file-type";
import { getDirectory } from "../util/fs";
import { CacheLocation } from "./location";
import { decompress, decompressSync, gzip } from "fflate";
export const chrome = new CacheLocation("Google Chrome", async (drive, users) => {
	for (const user of users) {
		try {
			const chromeFolder = await getDirectory(user, `AppData/Local/Google/Chrome/User Data`.split("/"));
			if (!chromeFolder) continue;
			for await (const profile of chromeFolder.values()) {
				if (profile.kind !== "directory") continue;
				try {
					const cache = await (await profile.getDirectoryHandle("Cache")).getDirectoryHandle("Cache_Data");
					for await (const file of cache.values()) {
						if (file.name.startsWith("f_") && file.kind === "file") {
							const data = await (await file.getFile()).arrayBuffer();
							const type = await fileTypeFromBuffer(data);
							if (type?.mime === "application/gzip") {
								const decompressed = decompressSync(new Uint8Array(data));
								console.log(await fileTypeFromBuffer(decompressed) ?? decompressed.byteLength);
							}
						}
					}
				} catch (e) {
					continue;
				}
			}
		} catch {}
	}
	return undefined;
});
