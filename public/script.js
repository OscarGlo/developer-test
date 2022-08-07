window.addEventListener("load", () => {
	let file = null;

	const fileLabel = document.getElementById("fileLabel");
	const fileInput = document.getElementById("fileInput");
	fileInput.addEventListener("change", evt => {
		if (evt.target.files && evt.target.files.length > 0) {
			file = evt.target.files.item(0);
			fileLabel.innerText = file.name;
		} else {
			file = null;
			fileLabel.innerText = "Choose empire file...";
		}
	});

	const odds = document.getElementById("odds");
	const submitJson = document.getElementById("submitJson");
	submitJson.addEventListener("click", async () => {
		if (!file) return;

		const result = await fetch(`/solver`, {
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			body: await file.text()
		})
			.then(res => res.json())
			.catch(console.error);

		odds.innerText = "= " + result.odds * 100 + "%";
	});
});