import "native-file-system-adapter";
import { useEffect, useState } from "react";
import { CacheItem, CacheLocation } from "./locations/location";
import { FileDropper } from "./component/FileDropper";
import { CacheViewer } from "./component/CacheViewer";
import { cacheLocations } from "./locations/locations";
import { filterEntries } from "./util/fs";
import init, { decompress } from "wasm-gzip";
import wasmGzipUrl from "wasm-gzip/wasm_gzip.wasm?url";
import { fileType } from "./util/util";
import { FileTypeResult } from "file-type";

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
			console.log("GOT HERE");
			if (!cache) newData.push({ location, items: undefined });
			else newData.push({ location, items: cache });
		}
		setStatus("Loading viewer...");
		console.log("GOT 2");
		setData(newData);
	};
	const decompressFile = async (location: string, id: string) => {
		if (data === null) return;
		const newData = [];
		for (const section of data) {
			if (section.location.name !== location || section.items === undefined) {
				newData.push(section);
				continue;
			}
			const newSection = { location: section.location, items: [] as CacheItem[] };
			for (const item of section.items) {
				if (item.id !== id) {
					newSection.items.push(item);
					continue;
				}
				const newBlob = new Blob([decompress(new Uint8Array(await item.file.arrayBuffer()))]);
				const newType = await fileType(newBlob);
				newSection.items.push({
					...item,
					type: newType ?? ({ ext: "bin", mime: "application/octet-stream" } as unknown as FileTypeResult),
					blob: newBlob,
					url: URL.createObjectURL(newBlob),
				});
			}
			newData.push(newSection);
		}
		setData(newData);
	};
	return <>{data === null ? <FileDropper dropDrive={dropDrive} status={status} /> : <CacheViewer data={data} decompress={decompressFile} />}</>;
}

export default App;
