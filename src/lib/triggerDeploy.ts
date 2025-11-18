export async function triggerDeploy() {
  try {
    const url = process.env.NEXT_PUBLIC_VERCEL_DEPLOY_HOOK_URL;

    if (!url) {
      console.error("Deploy Hook URL is missing");
      return;
    }

    await fetch(url, {
      method: "POST",
    });

    console.log("🔁 Vercel Deploy Triggered Successfully");
  } catch (err) {
    console.error("Deploy Trigger Error:", err);
  }
}