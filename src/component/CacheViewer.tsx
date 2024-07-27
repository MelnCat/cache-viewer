import { useMemo, useRef, useState } from "react";
import { CacheItem, CacheLocation } from "../locations/location";
import styles from "./CacheViewer.module.css";

export const CacheViewer = ({ data }: { data: { location: CacheLocation; items: CacheItem[] | undefined }[] }) => {
	const [selected, setSelected] = useState(() => (data.find(x => x.items) ?? data[0]).location.name);
	const selectedData = useMemo(() => data.find(x => x.location.name === selected)!, [selected]);
	const cacheContentRef = useRef<HTMLElement | null>(null);
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
			</nav>
			<article className={styles.cacheView}>
				<h1>{selectedData.location.name}</h1>
				<section className={styles.cacheContent} ref={cacheContentRef}>
					{selectedData.items === undefined ? (
						<p>Nothing</p>
					) : (
						selectedData.items
							.filter(x => x.type)
							.map(item => (
								<section key={item.id} className={styles.cacheItem} style={item.type?.mime.startsWith("image") ? { backgroundColor: "unset" } : {}}>
									{item.type?.mime.startsWith("image") ? (
										<img src={item.url} loading="lazy" />
									) : item.type?.mime.startsWith("audio") ? (
										<audio controls src={item.url}></audio>
									) : item.type?.mime.startsWith("video") ? (
										<video controls src={item.url}></video>
									) : (
										<div className={styles.downloadBox}>
											{item.type?.mime}
											<a href={item.url} download={`file.${item.type?.ext}`}>
												Download
											</a>
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
