export const getDirectory = async (initial: FileSystemDirectoryHandle, path: string[]): Promise<FileSystemDirectoryHandle | undefined> => {
	try {
		const directory = await initial.getDirectoryHandle(path[0]);
		if (path.length > 1) return getDirectory(directory, path.slice(1));
		else return directory;
	} catch {
		/* noop */
	}
};
export const findEntry = async <T extends "file" | "directory">(
	handle: FileSystemDirectoryHandle,
	kind: T,
	predicate: ((handle: FileSystemHandle) => boolean) | ((handle: FileSystemHandle) => Promise<boolean>)
): Promise<(T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle) | undefined> => {
	for await (const entry of handle.values()) {
		if ((await predicate(entry)) && entry.kind === kind) return entry as T extends "file" ? FileSystemFileHandle : FileSystemDirectoryHandle;
	}
};
export const filterEntries = async <T extends "file" | "directory">(
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
