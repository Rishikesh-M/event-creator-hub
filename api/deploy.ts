export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const deployUrl = process.env.VERCEL_DEPLOY_HOOK;

    if (!deployUrl) {
      return new Response(
        JSON.stringify({ error: "Missing VERCEL_DEPLOY_HOOK env variable" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trigger Vercel Deploy Hook
    await fetch(deployUrl, { method: "POST" });

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Instant publish triggered successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to trigger deploy" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
