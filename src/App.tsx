import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import styles from "./App.module.css";
import "native-file-system-adapter";
import initSqlJs from "@stephen/sql.js";

const getDirectory = async (initial: FileSystemDirectoryHandle, path: string[]): Promise<FileSystemDirectoryHandle | null> => {
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
	predicate: ((handle: FileSystemHandle) => boolean) | ((handle: FileSystemHandle) => Promise<boolean>)
): Promise<(T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle)[]> => {
	const matching: (T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle)[] = [];
	for await (const entry of handle.values()) {
		if ((await predicate(entry)) && entry.kind === kind) matching.push(entry as (typeof matching)[number]);
	}
	return matching;
};

function App() {
	const [dragging, setDragging] = useState(false);
	const [instances, setInstances] = useState<string[]>([]);
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
		const users = await findEntry(cDrive, "directory", x => x.name === "Users");
		if (!users) return;
		for await (const user of users.values()) {
			if (user.kind !== "directory") continue;
			//const instancesFolder = await getDirectory(user, `AppData/Roaming/PrismLauncher/instances`.split("/"));
			const instancesFolder = await getDirectory(user, `AppData/Local/Google/Chrome/User Data`.split("/"));
			if (!instancesFolder) continue;
			const profiles = await filterEntries(instancesFolder, "directory", x => x.name === "Default" || x.name.startsWith("Profile "));
			console.log(profiles);
			for (const profile of profiles) {
				try {
					const history = await profile.getFileHandle("History");
					const SQL = await initSqlJs({
						locateFile: file => `https://sql.js.org/dist/${file}`,
					});
					console.log(SQL);
				} catch (e) {
					console.log(e);
					continue;
				}
			}
			const list: string[] = [];
			for await (const file of instancesFolder.values()) if (file.kind === "directory" && !file.name.startsWith(".")) list.push(file.name);
			setInstances(list);
		}
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
			<ul>
				{instances.map(x => (
					<li key={x}>{x}</li>
				))}
			</ul>
			<div style={{ backgroundColor: dragging ? "#dddddd" : "" }} className={styles.dropTarget} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
				Drag and drop C: into me
			</div>
		</>
	);
}

export default App;
