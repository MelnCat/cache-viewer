import { fileTypeFromBlob, FileTypeResult } from "file-type";

export const fileType = async (blob: Blob) => {
	return Promise.race([
		await fileTypeFromBlob(blob),
		new Promise<FileTypeResult>(res =>
			setTimeout(
				async () =>
					res(((await blob.text())[0] === "{" ? { ext: "json", mime: "application/json" } : { ext: "bin", mime: "application/unknown" }) as unknown as FileTypeResult),
				2000
			)
		),
	]);
};
