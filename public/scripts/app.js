const storedTemperatureUnit = localStorage.getItem(
	"weatheria-temperature-unit",
);
const storedWindUnit = localStorage.getItem("weatheria-wind-unit");
const recentSearchKey = "weatheria-recent-searches";

function setTemperatureUnit(unit) {
	const fahrenheit = unit === "f";
	document
		.querySelectorAll("[data-celsius][data-fahrenheit]")
		.forEach((element) => {
			const value = Number(
				element.dataset[fahrenheit ? "fahrenheit" : "celsius"],
			);
			const rounded = Math.round(value);
			if (element.classList.contains("temperature")) {
				element.querySelector(".temperature-value").textContent = rounded;
				element.querySelector(".temperature-unit").textContent = fahrenheit
					? "F"
					: "C";
			} else if (element.classList.contains("temperature-note")) {
				element.textContent = `Feels like ${rounded}\u00b0${fahrenheit ? "F" : "C"}`;
			} else {
				element.textContent = `${rounded}\u00b0`;
			}
		});
	document.querySelectorAll("[data-temperature-unit]").forEach((button) => {
		button.setAttribute(
			"aria-pressed",
			String(button.dataset.temperatureUnit === unit),
		);
	});
	localStorage.setItem("weatheria-temperature-unit", unit);
}

function setWindUnit(unit) {
	const mph = unit === "mph";
	document.querySelectorAll(".wind-value").forEach((element) => {
		const value = Number(element.dataset[mph ? "mph" : "kmh"]);
		element.firstChild.textContent = value.toFixed(1);
		element.querySelector("span").textContent = ` ${mph ? "mph" : "km/h"}`;
	});
	document.querySelectorAll("[data-wind-unit]").forEach((button) => {
		button.setAttribute(
			"aria-pressed",
			String(button.dataset.windUnit === unit),
		);
	});
	localStorage.setItem("weatheria-wind-unit", unit);
}

document.querySelectorAll("[data-temperature-unit]").forEach((button) => {
	button.addEventListener("click", () =>
		setTemperatureUnit(button.dataset.temperatureUnit),
	);
});

document.querySelectorAll("[data-wind-unit]").forEach((button) => {
	button.addEventListener("click", () => setWindUnit(button.dataset.windUnit));
});

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#city-search");
const recentSearches = document.querySelector(".recent-searches");
const recentSearchList = document.querySelector(".recent-search-list");
const clearRecentButton = document.querySelector(".clear-recent");

function getRecentCities() {
	try {
		const cities = JSON.parse(localStorage.getItem(recentSearchKey) || "[]");
		return Array.isArray(cities)
			? cities.filter((city) => typeof city === "string")
			: [];
	} catch {
		return [];
	}
}

function renderRecentSearches() {
	const cities = getRecentCities();
	recentSearchList.replaceChildren();
	recentSearches.hidden = cities.length === 0;
	for (const city of cities) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = city;
		button.addEventListener("click", () => {
			searchInput.value = city;
			searchForm.requestSubmit();
		});
		recentSearchList.append(button);
	}
}

searchForm?.addEventListener("submit", () => {
	const city = searchInput.value.trim();
	if (!city) return;
	const cities = getRecentCities();
	const updatedCities = [
		city,
		...cities.filter(
			(recentCity) => recentCity.toLowerCase() !== city.toLowerCase(),
		),
	].slice(0, 5);
	localStorage.setItem(recentSearchKey, JSON.stringify(updatedCities));
});

clearRecentButton?.addEventListener("click", () => {
	localStorage.removeItem(recentSearchKey);
	renderRecentSearches();
});

if (recentSearches) renderRecentSearches();

if (storedTemperatureUnit === "f") setTemperatureUnit("f");
if (storedWindUnit === "mph") setWindUnit("mph");
