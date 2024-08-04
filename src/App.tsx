import "native-file-system-adapter";
import { useEffect, useState } from "react";
import { CacheItem, CacheLocation } from "./locations/location";
import { FileDropper } from "./component/FileDropper";
import { CacheViewer } from "./component/CacheViewer";
import { cacheLocations } from "./locations/locations";
import { filterEntries } from "./util/fs";
import init from "wasm-gzip";
import wasmGzipUrl from "wasm-gzip/wasm_gzip.wasm?url";

function App() {
	const [data, setData] = useState<{ location: CacheLocation; items: CacheItem[] | undefined }[] | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	useEffect(() => {
		init(wasmGzipUrl);
	}, []);
	const dropDrive = async (drive: FileSystemDirectoryHandle) => {
		const newData: typeof data = [];
		for (const location of cacheLocations) {
			setStatus(`Loading ${location.name}...`);
			const userDirectories = await filterEntries(await drive.getDirectoryHandle("Users"), "directory");
			const cache = await location.scanForItems(drive, userDirectories, (curr, max) => setStatus(`Loading ${location.name}... (${curr}/${max})`));
			console.log("GOT HERE")
			if (!cache) newData.push({ location, items: undefined });
			else newData.push({ location, items: cache });
		}
		setStatus("Loading viewer...")
		console.log("GOT 2")
		setData(newData);
	};
	return <>{data === null ? <FileDropper dropDrive={dropDrive} status={status} /> : <CacheViewer data={data} />}</>;
}

export default App;
