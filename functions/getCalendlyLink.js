
// Cache control for the function (1 hour)
export const config = {
  path: "/functions/getCalendlyLink",
  cache: {
    edge: {
      maxAgeSeconds: 3600, // 1 hour
    },
  },
};

export default async function handler(req) {
  try {
    const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;

    if (!CALENDLY_TOKEN) {
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch the user's data from Calendly API
    const response = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${CALENDLY_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status}`);
    }

    const data = await response.json();
    const scheduling_url = data.resource.scheduling_url;

    // Return only what's needed
    return new Response(
      JSON.stringify({ scheduling_url }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Calendly function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch Calendly data",
        details: error.message
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
