import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiNinjasKey = process.env.API_NINJAS_KEY;
const openWeatherKey = process.env.OPENWEATHER_API_KEY;

function summarizeForecast(entries, timezoneOffset) {
	const days = new Map();

	for (const entry of entries) {
		const localDate = new Date((entry.dt + timezoneOffset) * 1000)
			.toISOString()
			.slice(0, 10);
		if (!days.has(localDate)) days.set(localDate, []);
		days.get(localDate).push(entry);
	}

	return [...days.entries()].slice(0, 5).map(([date, entriesForDay]) => {
		const midday = entriesForDay.reduce((closest, entry) => {
			const localHour = new Date(
				(entry.dt + timezoneOffset) * 1000,
			).getUTCHours();
			const closestHour = new Date(
				(closest.dt + timezoneOffset) * 1000,
			).getUTCHours();
			return Math.abs(localHour - 12) < Math.abs(closestHour - 12)
				? entry
				: closest;
		});
		const localDate = new Date(`${date}T12:00:00Z`);
		return {
			date: localDate.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			}),
			icon: midday.weather[0].icon,
			description: midday.weather[0].description,
			high: Math.max(...entriesForDay.map((entry) => entry.main.temp_max)),
			low: Math.min(...entriesForDay.map((entry) => entry.main.temp_min)),
		};
	});
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.render("index.ejs");
});

// Get Weather
app.post("/getWeather", async (req, res) => {
	const city = req.body.city?.trim();

	if (!city) {
		return res.status(400).render("index.ejs", {
			searchCity: city,
			error: "Enter a city or town to search for its weather.",
		});
	}

	if (!apiNinjasKey || !openWeatherKey) {
		return res.status(503).render("index.ejs", {
			searchCity: city,
			error:
				"Weather search is not configured. Set API_NINJAS_KEY and OPENWEATHER_API_KEY.",
		});
	}

	try {
		const coordinates = await axios.get(
			"https://api.api-ninjas.com/v1/geocoding",
			{
				params: { city },
				headers: {
					"X-Api-Key": apiNinjasKey,
				},
			},
		);

		const location = coordinates.data?.[0];
		if (!location) {
			return res.status(404).render("index.ejs", {
				searchCity: city,
				error: `No location found for "${city}". Check the spelling and try again.`,
			});
		}

		const result = await axios.get(
			"https://api.openweathermap.org/data/2.5/weather",
			{
				params: {
					lat: location.latitude,
					lon: location.longitude,
					units: "metric",
					appid: openWeatherKey,
				},
			},
		);
		let forecastDays = [];
		try {
			const forecast = await axios.get(
				"https://api.openweathermap.org/data/2.5/forecast",
				{
					params: {
						lat: location.latitude,
						lon: location.longitude,
						units: "metric",
						appid: openWeatherKey,
					},
				},
			);
			forecastDays = summarizeForecast(
				forecast.data.list || [],
				result.data.timezone || 0,
			);
		} catch (forecastError) {
			console.error("Forecast lookup failed:", forecastError.message);
		}

		res.render("index.ejs", {
			weatherData: result.data,
			searchCity: city,
			forecastDays,
		});
	} catch (error) {
		console.error("Weather lookup failed:", error.message);
		const message =
			error.response?.status === 401
				? "The weather service rejected its API key. Check your API configuration."
				: "Weather data is temporarily unavailable. Please try again shortly.";
		res.status(502).render("index.ejs", { searchCity: city, error: message });
	}
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
