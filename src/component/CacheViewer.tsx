import { fileTypeFromBlob } from "file-type";
import { CacheItem, CacheLocation } from "../locations/location";
import styles from "./CacheViewer.module.css";

export const CacheViewer = ({ data }: { data: { location: CacheLocation; items: CacheItem[] | null }[] }) => {
	console.log("VIEWR");
	console.log(typeof data, data);
	return (
		<div>
			{data.map(({ location, items }) => (
				<article className={styles.cacheView} key={location.name}>
					<h1>{location.name}</h1>
					<section className={styles.cacheContent}>
						{items === null ? (
							<p>Nothing</p>
						) : (
							items
								.filter(x => x.type)
								.map((item, i) => (
									<section key={i} className={styles.cacheItem}>
										{item.type?.mime.startsWith("image") ? (
											<img src={item.url} loading="lazy" />
										) : item.type?.mime.startsWith("audio") ? (
											<audio controls src={item.url}></audio>
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
			))}
		</div>
	);
};
