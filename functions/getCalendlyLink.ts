
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
        JSON.stringify({ error: "Missing token" }),
        {
          status: 401,
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
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: text }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const scheduling_url = data.resource?.scheduling_url;
    
    if (!scheduling_url) {
      return new Response(
        JSON.stringify({ error: "No scheduling URL found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ link: scheduling_url }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
