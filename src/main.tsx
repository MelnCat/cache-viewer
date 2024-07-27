import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.body.addEventListener("dragover", event => {
	event.preventDefault();
	if (event.dataTransfer && event.target === document.body) {
		event.dataTransfer.dropEffect = "none";
	}
});

document.body.addEventListener("drop", event => {
	event.preventDefault();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
