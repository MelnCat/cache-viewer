import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import styles from "./App.module.css";
import "native-file-system-adapter";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import initSqlJs from "sql.js/dist/sql-wasm.js";
import * as idb from "idb";

const getDirectory = async (initial: FileSystemDirectoryHandle, path: string[]): Promise<FileSystemDirectoryHandle | undefined> => {
	try {
		const directory = await initial.getDirectoryHandle(path[0]);
		if (path.length > 1) return getDirectory(directory, path.slice(1));
		else return directory;
	} catch {
		/* noop */
	}
};
const findEntry = async <T extends "file" | "directory">(
	handle: FileSystemDirectoryHandle,
	kind: T,
	predicate: ((handle: FileSystemHandle) => boolean) | ((handle: FileSystemHandle) => Promise<boolean>)
): Promise<(T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle) | undefined> => {
	for await (const entry of handle.values()) {
		if ((await predicate(entry)) && entry.kind === kind) return entry as T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle;
	}
};
const filterEntries = async <T extends "file" | "directory">(
	handle: FileSystemDirectoryHandle,
	kind: T,
	predicate?: ((handle: FileSystemHandle) => boolean) | ((handle: FileSystemHandle) => Promise<boolean>)
): Promise<(T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle)[]> => {
	const matching: (T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle)[] = [];
	for await (const entry of handle.values()) {
		if ((predicate === undefined || (await predicate(entry))) && entry.kind === kind) matching.push(entry as (typeof matching)[number]);
	}
	return matching;
};

const db = await idb.openDB("driveHandle", 1, {
	upgrade(init) {
		if (!init.objectStoreNames.contains("driveHandle")) {
			const store = init.createObjectStore("driveHandle", { keyPath: "id", autoIncrement: true });
		}
	},
});

function App() {
	const [dragging, setDragging] = useState(false);
	const [data, setData] = useState<{ url: string; title: string; last_visit_time: number }[]>([]);
	const parseDrive = async(drive: FileSystemDirectoryHandle) => {
		const users = await findEntry(drive, "directory", x => x.name === "Users");
		if (!users) return;
		for await (const user of users.values()) {
			if (user.kind !== "directory") continue;
			const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
			//const instancesFolder = await getDirectory(user, `AppData/Roaming/PrismLauncher/instances`.split("/"));
			try {
				const chromeFolder = await getDirectory(user, `AppData/Local/Google/Chrome/User Data`.split("/"));
				if (!chromeFolder) continue;
				const profiles = await filterEntries(chromeFolder, "directory", x => x.name === "Default" || x.name.startsWith("Profile "));
				for (const profile of profiles) {
					try {
						const history = await profile.getFileHandle("History");
						const db = new SQL.Database(new Uint8Array(await(await history.getFile()).arrayBuffer()));
						const statement = db.prepare("SELECT * FROM 'urls' ORDER BY last_visit_time DESC LIMIT 100");
						const historyList: { url: string; title: string; last_visit_time: number }[] = [];
						while (statement.step()) historyList.push(statement.getAsObject() as (typeof historyList)[number]);
						setData(d =>
							d
								.concat(historyList.map(x => ({ ...x, last_visit_time: x.last_visit_time / 1000 - 11644473600000 })))
								.sort((a, b) => b.last_visit_time - a.last_visit_time)
						);
					} catch (e) {
						continue;
					}
				}
			} catch {
				/* noop */
			}
			try {
				const firefoxFolder = await getDirectory(user, `AppData/Roaming/Mozilla/Firefox/Profiles`.split("/"));
				if (!firefoxFolder) continue;
				const profiles = await filterEntries(firefoxFolder, "directory");
				for (const profile of profiles) {
					try {
						const history = await profile.getFileHandle("places.sqlite");
						const db = new SQL.Database(new Uint8Array(await(await history.getFile()).arrayBuffer()));
						const statement = db.prepare("SELECT * FROM 'moz_places' ORDER BY last_visit_date DESC LIMIT 100");
						const historyList: { url: string; title: string; last_visit_time: number }[] = [];
						while (statement.step()) {
							const obj = statement.getAsObject() as { url: string; title: string; last_visit_date: number };
							historyList.push({ url: obj.url, title: obj.title, last_visit_time: obj.last_visit_date / 1000 });
						}
						setData(d => d.concat(historyList).sort((a, b) => b.last_visit_time - a.last_visit_time));
					} catch (e) {
						continue;
					}
				}
			} catch {
				/* noop */
			}
		}
	};
	useEffect(() => {
		(async () => {
			const trx = db.transaction(["driveHandle"], "readonly");
			if ((await trx.objectStore("driveHandle").count()) > 0) {
				const value = (await trx.objectStore("driveHandle").getAll())[0];
				try {
					const handle = value.handle as FileSystemDirectoryHandle;
					/*document.addEventListener("click", async() => {
						await handle.requestPermission({ mode: "readwrite" });
						await parseDrive(value.handle);
					})*/

				} catch (e) { console.log(e) /* noop */ }
			}
		})();
	}, []);
	const onDrop: React.DragEventHandler<HTMLDivElement> = async event => {
		event.preventDefault();
		setDragging(false);
		const cDrive = await (async () => {
			for (const file of event.dataTransfer.items) {
				const h = await file.getAsFileSystemHandle();
				if (h?.kind === "directory" && (h.name === "\\" || h.name === "C:")) return h as FileSystemDirectoryHandle;
			}
		})();
		if (!cDrive) return alert("Please drag and drop the C: drive.");
		const trx = db.transaction(["driveHandle"], "readwrite");
		await trx.objectStore("driveHandle").clear();
		await trx.objectStore("driveHandle").add({ handle: cDrive });
		await parseDrive(cDrive);
	};
	const onDragLeave = () => {
		setDragging(false);
	};
	const onDragOver: React.DragEventHandler<HTMLDivElement> = event => {
		event.preventDefault();
		setDragging(true);
	};
	return (
		<>
			{data.length === 0 ? null : <h1>heres your search history lol</h1>}
			<ul className={styles.historyList}>
				{data.map((x, i) => (
					<li key={i}>
						<b>{x.title}</b>
						<br />
						{x.url}
					</li>
				))}
			</ul>
			<div style={{ backgroundColor: dragging ? "#dddddd" : "" }} className={styles.dropTarget} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
				Drag and drop the C: Drive into me
			</div>
		</>
	);
}

export default App;
