const storedTemperatureUnit = localStorage.getItem(
	"weatheria-temperature-unit",
);
const storedWindUnit = localStorage.getItem("weatheria-wind-unit");

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
		element.innerHTML = `${value.toFixed(1)}<span> ${mph ? "mph" : "km/h"}</span>`;
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

if (storedTemperatureUnit === "f") setTemperatureUnit("f");
if (storedWindUnit === "mph") setWindUnit("mph");
