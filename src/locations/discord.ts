import { getDirectory } from "../util/fs";
import { CacheLocation, UnprocessedCacheItem } from "./location";

export const discord = new CacheLocation("Discord", async drive => {
	return [];
});
export const discordCanary = new CacheLocation("Discord Canary", async (drive, users) => {
	let items: UnprocessedCacheItem[] = [];
	console.log("GOT HERE")
	for (const user of users) {
		console.log("GOT HEREA")
		try {
			const cacheData = await getDirectory(user, "AppData/Roaming/discordcanary/Cache/Cache_Data".split("/"));
			if (!cacheData) continue;
			let i = 0;
			for await (const file of cacheData.values()) {
				console.log("GOT HERVE")
				if (file.kind !== "file") continue;
				items.push({ blob: await file.getFile() });
			}
		} catch {}
	}
	console.log("GOT HERE 2")
	return items;
});