import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT|3000;

const anAPI = "3HbF+xsKlupDnTKSIvECsw==LcbvvVHOKDVB7qq2";
const owmAPI = "5768e9edc822ea1131a9076c4252df73";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

// Get Weather
app.post("/getWeather", async (req, res) => {
    try {
        // Get latitudes and longitudes from API Ninja
        const coordinates = await axios.get("https://api.api-ninjas.com/v1/geocoding?city=" + req.body.city, {
            headers: {
                'X-Api-Key': anAPI
            }
        });
        console.log(coordinates.data);
        const lat = coordinates.data[0].latitude;
        const lon = coordinates.data[0].longitude;

        // Get weather details from open weather map
        const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${owmAPI}`)
        console.log(result.data);
        res.render("index.ejs", {
            weatherData: result.data,
            state: coordinates.data[0].state
        })
    }
    catch (error) {
        console.log("Failed to make request", error.response.data);
        res.render("index.ejs", {
            error: error.message
        })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
