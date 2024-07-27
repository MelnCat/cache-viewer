import "native-file-system-adapter";
import { useState } from "react";
import { CacheItem, CacheLocation } from "./locations/location";
import { FileDropper } from "./component/FileDropper";
import { CacheViewer } from "./component/CacheViewer";
import { cacheLocations } from "./locations/locations";
import { filterEntries } from "./util/fs";

function App() {
	const [data, setData] = useState<{ location: CacheLocation; items: CacheItem[] | null }[] | null>(null);
	const dropDrive = async (drive: FileSystemDirectoryHandle) => {
		const newData: typeof data = [];
		for (const location of cacheLocations) {
			const userDirectories = await filterEntries(await drive.getDirectoryHandle("Users"), "directory");
			const cache = await location.scanForItems(drive, userDirectories);
			if (!cache) newData.push({ location, items: null });
			else newData.push({ location, items: cache });
		}
		setData(newData);
	};
	return <>{data === null ? <FileDropper dropDrive={dropDrive} /> : <CacheViewer data={data} />}</>;
}

export default App;
