import { getDirectory } from "../util/fs";
import { CacheLocation, UnprocessedCacheItem } from "./location";

class DiscordCacheLocation extends CacheLocation {
	constructor(name: string, folder: string) {
		super(name, async (drive, users) => {
			const items: UnprocessedCacheItem[] = [];
			for (const user of users) {
				try {
					const cacheData = await getDirectory(user, `AppData/Roaming/${folder}/Cache/Cache_Data`.split("/"));
					if (!cacheData) continue;
					for await (const file of cacheData.values()) {
						if (file.kind !== "file") continue;
						items.push({ id: `${user.name}/${file.name}`, file: await file.getFile() });
					}
				} catch {}
			}
			return items.length === 0 ? undefined : items;
		})
	}
}

export const discord = new DiscordCacheLocation("Discord", "discord");
export const discordPtb = new DiscordCacheLocation("Discord PTB", "discordptb");
export const discordCanary = new DiscordCacheLocation("Discord Canary", "discordcanary");