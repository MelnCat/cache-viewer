import { getDirectory } from "../util/fs";
import { CacheLocation, UnprocessedCacheItem } from "./location";
export const firefox = new CacheLocation("Mozilla Firefox", async (drive, users) => {
	const items: UnprocessedCacheItem[] = [];
	for (const user of users) {
		try {
			const firefoxProfiles = await getDirectory(user, `AppData/Local/Mozilla/Firefox/Profiles`.split("/"));
			if (!firefoxProfiles) continue;
			for await (const profile of firefoxProfiles.values()) {
				if (profile.kind !== "directory") continue;
				try {
					const cache = await (await profile.getDirectoryHandle("cache2")).getDirectoryHandle("Entries");
					for await (const file of cache.values()) {
						if (file.kind === "file") {
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
