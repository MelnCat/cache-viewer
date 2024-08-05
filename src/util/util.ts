import { Detector, fileTypeFromBlob, FileTypeParser, FileTypeResult } from "file-type";

const customDetectors: Detector[] = [
	async tokenizer => {
		const svgHeader = `<svg>`.split("").map(x => x.charCodeAt(0));

		const buffer = new Uint8Array(svgHeader.length);
		await tokenizer.peekBuffer(buffer, { length: svgHeader.length, mayBeLess: true });
		if (svgHeader.every((value, index) => value === buffer[index])) {
			return { ext: "svg", mime: "image/svg+xml" } as unknown as FileTypeResult;
		}

		return undefined;
	},
	async tokenizer => {
		const buffer = new Uint8Array(2);
		await tokenizer.peekBuffer(buffer, { length: 2, mayBeLess: true });
		if ((String.fromCharCode(buffer[0]) === "[" || String.fromCharCode(buffer[0]) === "{") && buffer[1] < 128 && buffer[1] >= 32) {
			return { ext: "json", mime: "application/json" } as unknown as FileTypeResult;
		}

		return undefined;
	},
	async tokenizer => {
		const buffer = new Uint8Array(10);
		await tokenizer.peekBuffer(buffer, { length: 10, mayBeLess: true });
		if (buffer.every(x => x < 128 && x >= 32)) {
			return { ext: "txt", mime: "text/plain" } as unknown as FileTypeResult;
		}
		return undefined;
	},
];

const parser = new FileTypeParser({ customDetectors });

export const fileType = async (blob: Blob) => {
	return Promise.race([await parser.fromBlob(blob), new Promise<undefined>(res => setTimeout(() => res(undefined), 2000))]);
};
