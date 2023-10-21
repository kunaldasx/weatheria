import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiNinjasKey = process.env.API_NINJAS_KEY;
const openWeatherKey = process.env.OPENWEATHER_API_KEY;

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

		res.render("index.ejs", {
			weatherData: result.data,
			searchCity: city,
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
