import { useState } from "react";
import styles from "./FileDropper.module.css";

export const FileDropper = ({ dropDrive, status }: { dropDrive: (drive: FileSystemDirectoryHandle) => void, status: string | null }) => {
	const [dragState, setDragState] = useState<null | "wrong" | "ok">(null);
	const [dropped, setDropped] = useState(false);
	const onDrop = async (event: React.DragEvent) => {
		event.preventDefault();
		if (dragState === "wrong") {
			setDragState(null);
			return;
		}
		setDragState(null);
		const cDrive = await (async () => {
			for (const file of event.dataTransfer.items) {
				const h = await file.getAsFileSystemHandle();
				if (h?.kind === "directory" && (h.name === "\\" || h.name === "C:")) return h as FileSystemDirectoryHandle;
			}
		})();
		if (!cDrive) return alert("Please drag and drop the C: drive.");
		setDropped(true);
		dropDrive(cDrive);
	};
	const onDragLeave = () => {
		setDragState(null);
	};
	const onDragOver = async (event: React.DragEvent) => {
		event.preventDefault();
		if (![...event.dataTransfer.items].every(x => x.kind === "file")) {
			setDragState("wrong");
			event.dataTransfer.dropEffect = "none";
		} else {
			setDragState("ok");
			event.dataTransfer.effectAllowed = "link";
			event.dataTransfer.dropEffect = "link";
		}
	};
	return (
		<div
			{...(dropped ? { "data-dropped": true } : null)}
			style={{ backgroundColor: dragState === "ok" ? "#77777755" : dragState === "wrong" ? "#99444455" : "" }}
			className={styles.dropTarget}
			onDrop={onDrop}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
		>
			{status ?? (dragState === "wrong" ? "That is not the C: Drive" : dropped ? "Loading..." : "Drag and drop the C: Drive here")}
		</div>
	);
};
