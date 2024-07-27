import "native-file-system-adapter";
import { useState } from "react";
import initSqlJs from "sql.js/dist/sql-wasm.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import styles from "./App.module.css";
import { fileTypeFromBlob } from "file-type";
import { CacheItem, CacheLocation } from "./locations/location";
import { FileDropper } from "./component/FileDropper";

function App() {
	const [data, setData] = useState<{ location: CacheLocation; items: CacheItem }[] | null>(null);
	const dropDrive = (drive: FileSystemDirectoryHandle) => {};
	return <FileDropper dropDrive={dropDrive} />;
}

export default App;
