import { getDirectory } from "../util/fs";
import { CacheLocation, UnprocessedCacheItem } from "./location";
export const chrome = new CacheLocation("Google Chrome", async (drive, users) => {
	const items: UnprocessedCacheItem[] = [];
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
							items.push({ id: `${profile.name}/${file.name}`, file: await file.getFile() });
						}
					}
				} catch (e) {
					continue;
				}
			}
		} catch {}
	}
	return items.length === 0 ? undefined : items;
});
