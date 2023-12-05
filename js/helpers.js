function getUrlQuery(q, defaultV = "") {
	let query = {};
	let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		query[key] = value;
	});
	if (typeof (query[q]) === "undefined") {
		query[q] = defaultV;
	}
	return query[q];
}
