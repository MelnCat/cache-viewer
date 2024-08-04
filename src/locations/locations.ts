import { chrome } from "./chrome";
import { discord, discordCanary, discordPtb } from "./discord";
import { firefox } from "./firefox";
import { CacheLocation } from "./location";

export const cacheLocations: CacheLocation[] = [discord, discordPtb, discordCanary, chrome, firefox];
