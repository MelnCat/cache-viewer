import { useMemo, useRef, useState } from "react";
import { CacheItem, CacheLocation } from "../locations/location";
import styles from "./CacheViewer.module.css";

export const CacheViewer = ({ data, decompress }: { data: { location: CacheLocation; items: CacheItem[] | undefined }[]; decompress: (location: string, id: string) => void }) => {
	const [selected, setSelected] = useState(() => (data.find(x => x.items) ?? data[0]).location.name);
	const selectedData = useMemo(() => data.find(x => x.location.name === selected)!, [selected, data]);
	const cacheContentRef = useRef<HTMLElement | null>(null);
	const [showMisc, setShowMisc] = useState(false);
	return (
		<main className={styles.main}>
			<nav className={styles.navbar}>
				{data.map(x => (
					<button
						disabled={x.items === undefined}
						key={x.location.name}
						onClick={() => {
							setSelected(x.location.name);
							cacheContentRef.current?.scroll({ top: 0 });
						}}
						{...(x.location.name === selected ? { "data-selected": true } : null)}
					>
						{x.location.name}
					</button>
				))}
				<div>
					<span>Show Miscellaneous</span> <input type="checkbox" onChange={x => setShowMisc(x.target.checked)} checked={showMisc} />
				</div>
			</nav>
			<article className={styles.cacheView}>
				<h1>{selectedData.location.name}</h1>
				<section className={styles.cacheContent} ref={cacheContentRef}>
					{selectedData.items === undefined ? (
						<p>Nothing</p>
					) : (
						selectedData.items.map(item => (
							<section
								key={item.id}
								className={styles.cacheItem}
								style={{
									backgroundColor: item.type?.mime.startsWith("image") ? "unset" : "",
									display: item.type?.mime.startsWith("image") || item.type?.mime.startsWith("audio") || item.type?.mime.startsWith("video") || showMisc ? "" : "none",
								}}
							>
								{item.type?.mime.startsWith("image") ? (
									<img src={item.url} loading="lazy" />
								) : item.type?.mime.startsWith("audio") ? (
									<audio controls src={item.url}></audio>
								) : item.type?.mime.startsWith("video") ? (
									<video controls src={item.url}></video>
								) : (
									<div className={styles.downloadBox}>
										{item.type?.mime ?? "application/octet-stream"}
										<a href={item.url} download={`file.${item.type?.ext ?? "bin"}`}>
											Download
										</a>
										{item.type?.mime === "application/gzip" && <button onClick={() => decompress(selectedData.location.name, item.id)}>Decompress</button>}
									</div>
								)}
							</section>
						))
					)}
				</section>
			</article>
		</main>
	);
};
