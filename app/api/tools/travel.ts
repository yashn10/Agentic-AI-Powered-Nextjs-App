// app/api/tools/travel.ts
import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";
import qs from "qs";
import { parseUserDate } from "@/lib/utils/dateUtils";

// Get Amadeus API Token (with caching)
let amadeusTokenCache: { token: string; expiresAt: number } | null = null;


async function getAmadeusToken() {
    // Return cached token if still valid
    if (amadeusTokenCache && amadeusTokenCache.expiresAt > Date.now()) {
        return amadeusTokenCache.token;
    }

    try {
        // ✅ FIXED: Use form-urlencoded instead of JSON
        const response = await axios.post(
            "https://test.api.amadeus.com/v1/security/oauth2/token",
            qs.stringify({
                grant_type: "client_credentials",
                client_id: process.env.AMADEUS_CLIENT_ID,
                client_secret: process.env.AMADEUS_CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        amadeusTokenCache = {
            token: response.data.access_token,
            expiresAt: Date.now() + response.data.expires_in * 1000,
        };

        return response.data.access_token;
    } catch (err: any) {
        console.error(
            "[Amadeus] Auth error:",
            err.response?.data || err.message
        );
        throw new Error(
            `Amadeus authentication failed: ${err.response?.data?.error_description || err.message}`
        );
    }
}


export const searchFlightsTool = tool(
    async (input: any) => {
        const token = await getAmadeusToken();

        // ✅ PARSE THE DATE
        const parsedDate = parseUserDate(input.date);

        console.log("[searchFlights] Input params:", JSON.stringify(input, null, 2));
        console.log("[searchFlights] Original date:", input.date);
        console.log("[searchFlights] Parsed date:", parsedDate);

        console.log("[searchFlights] Input params:", JSON.stringify(input, null, 2));

        // ✅ Don't catch here - let errors bubble to middleware
        const response = await axios.get(
            "https://test.api.amadeus.com/v2/shopping/flight-offers",
            {
                params: {
                    originLocationCode: input.from.toUpperCase(),
                    destinationLocationCode: input.to.toUpperCase(),
                    departureDate: parsedDate,
                    adults: input.adults || 1,
                    nonStop: input.nonStop === true ? "true" : "false",
                    max: 5,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log(
            "[searchFlights] Success:",
            response.data.data?.length,
            "flights found"
        );

        if (!response.data.data || response.data.data.length === 0) {
            return {
                flights: [],
                message: "No flights found for the selected dates",
            };
        }

        const flights = response.data.data.map((flight: any) => ({
            id: flight.id,
            price: {
                total: flight.price.total,
                currency: flight.price.currency,
            },
            duration: flight.itineraries[0].duration,
            segments: flight.itineraries[0].segments.map((seg: any) => ({
                departure: seg.departure.at,
                arrival: seg.arrival.at,
                airline: seg.operating?.carrierCode || seg.carrierCode,
                flightNumber: seg.number,
                aircraft: seg.aircraft?.code || "Unknown",
            })),
            validatingAirlineCodes: flight.validatingAirlineCodes,
        }));

        return {
            flights: flights.slice(0, 5),
            count: flights.length,
        };
        // ✅ No try/catch here - errors propagate to middleware
    },
    {
        name: "search_flights",
        description:
            "Search for available flights between airports. Requires airport codes (JFK, LAX, CDG, etc.), not city names. Auto-parses dates like '10 december' to YYYY-MM-DD format and adjusts year if in past.",
        schema: z.object({
            from: z
                .string()
                .describe("Departure airport IATA code (JFK, LAX, CDG, etc.)"),
            to: z
                .string()
                .describe("Destination airport IATA code (JFK, LAX, CDG, etc.)"),
            date: z.string().describe("Departure date (YYYY-MM-DD format)"),
            adults: z.number().optional().describe("Number of adults (default: 1)"),
            nonStop: z
                .boolean()
                .optional()
                .describe("Non-stop flights only"),
        }),
    }
);


export const searchHotelsTool = tool(
    async (input: any) => {
        const token = await getAmadeusToken();

        // ✅ PARSE BOTH DATES
        const checkInDate = parseUserDate(input.checkIn);
        const checkOutDate = parseUserDate(input.checkOut);

        console.log("[searchHotels] Input params:", JSON.stringify(input, null, 2));
        console.log("[searchHotels] Parsed dates:", {
            checkIn: checkInDate,
            checkOut: checkOutDate,
        });

        console.log("[searchHotels] Input params:", JSON.stringify(input, null, 2));

        const response = await axios.get(
            "https://test.api.amadeus.com/v3/shopping/hotel-offers",
            {
                params: {
                    cityCode: input.cityCode.toUpperCase(),
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    adults: input.adults || 1,
                    limit: 10,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log(
            "[searchHotels] Success:",
            response.data.data?.length,
            "hotels found"
        );

        if (!response.data.data || response.data.data.length === 0) {
            return {
                hotels: [],
                message: "No hotels found for the selected dates",
            };
        }

        const hotels = response.data.data.map((hotel: any) => ({
            id: hotel.id,
            name: hotel.name,
            rating: hotel.rating || "Not rated",
            address: {
                cityName: hotel.address?.cityName || "",
                countryCode: hotel.address?.countryCode || "",
            },
            offers: hotel.offers.map((offer: any) => ({
                price: {
                    total: offer.price.total,
                    currency: offer.price.currency,
                },
                checkInDate: offer.checkInDate,
                checkOutDate: offer.checkOutDate,
                policies: {
                    cancellation: offer.policies?.cancellation?.type || "Unknown",
                },
            })),
        }));

        return {
            hotels: hotels.slice(0, 10),
            count: hotels.length,
        };
        // ✅ No try/catch here - errors propagate to middleware
    },
    {
        name: "search_hotels",
        description:
            "Search for hotels in a city. Requires city codes (DEL for Delhi, BOM for Mumbai, NYC for New York). Auto-parses dates like '10 december' to YYYY-MM-DD format.",
        schema: z.object({
            cityCode: z
                .string()
                .describe(
                    "City code (DEL for Delhi, BOM for Mumbai, NYC for New York, LON for London, PAR for Paris)"
                ),
            checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
            checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
            adults: z.number().optional().describe("Number of adults"),
        }),
    }
);


export const getWeatherTool = tool(
    async (input: any) => {
        try {
            // Using Open-Meteo (completely free, no API key)
            const response = await axios.get(
                "https://api.open-meteo.com/v1/forecast",
                {
                    params: {
                        latitude: input.latitude,
                        longitude: input.longitude,
                        daily:
                            "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
                        temperature_unit: input.unit || "celsius",
                        timezone: "auto",
                        forecast_days: 7,
                    },
                }
            );

            const weather = response.data.daily.time.map(
                (date: string, idx: number) => ({
                    date,
                    maxTemp: response.data.daily.temperature_2m_max[idx],
                    minTemp: response.data.daily.temperature_2m_min[idx],
                    precipitation: response.data.daily.precipitation_sum[idx],
                    weatherCode: response.data.daily.weather_code[idx],
                })
            );

            return JSON.stringify({
                location: `${input.latitude}, ${input.longitude}`,
                forecast: weather,
                timezone: response.data.timezone,
            });
        } catch (err: any) {
            console.error("Get weather error:", err);
            return JSON.stringify({
                error: `Failed to get weather: ${err.message}`,
                forecast: [],
            });
        }
    },
    {
        name: "get_weather",
        description: "Get weather forecast for a location",
        schema: z.object({
            latitude: z.number().describe("Latitude of location"),
            longitude: z.number().describe("Longitude of location"),
            unit: z.string().optional().describe("Temperature unit (celsius/fahrenheit)"),
        }),
    }
);


export const getDirectionsTool = tool(
    async (input: any) => {
        try {
            // Using Open Route Service (completely free)
            const response = await axios.get(
                "https://api.openrouteservice.org/v2/directions/driving",
                {
                    params: {
                        start: `${input.startLon},${input.startLat}`,
                        end: `${input.endLon},${input.endLat}`,
                        format: "json",
                    },
                    headers: {
                        Authorization: process.env.OPENROUTESERVICE_API_KEY || "",
                    },
                }
            );

            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return JSON.stringify({
                    distance: route.summary?.distance || 0,
                    duration: route.summary?.duration || 0,
                    geometry: route.geometry,
                    bbox: route.bbox,
                });
            }

            return JSON.stringify({
                error: "No route found",
                routes: [],
            });
        } catch (err: any) {
            console.error("Get directions error:", err);
            return JSON.stringify({
                error: `Failed to get directions: ${err.message || "Unknown error"}`,
                routes: [],
            });
        }
    },
    {
        name: "get_directions",
        description: "Get directions between two coordinates",
        schema: z.object({
            startLat: z.number().describe("Starting latitude"),
            startLon: z.number().describe("Starting longitude"),
            endLat: z.number().describe("Ending latitude"),
            endLon: z.number().describe("Ending longitude"),
        }),
    }
);


export const geocodeTool = tool(
    async (input: any) => {
        try {
            // Using Nominatim (free OpenStreetMap geocoding)
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: input.location,
                        format: "json",
                        limit: 5,
                    },
                    headers: {
                        "User-Agent": "travel-agent",
                    },
                }
            );

            if (!response.data || response.data.length === 0) {
                return JSON.stringify({
                    locations: [],
                    message: "Location not found",
                });
            }

            const locations = response.data.map((loc: any) => ({
                name: loc.display_name,
                latitude: parseFloat(loc.lat),
                longitude: parseFloat(loc.lon),
                type: loc.type,
            }));

            return JSON.stringify({
                locations,
                count: locations.length,
            });
        } catch (err: any) {
            console.error("Geocode error:", err);
            return JSON.stringify({
                error: `Failed to geocode: ${err.message}`,
                locations: [],
            });
        }
    },
    {
        name: "geocode_location",
        description: "Convert location name to coordinates",
        schema: z.object({
            location: z.string().describe("Location name (e.g., Paris, London)"),
        }),
    }
);
