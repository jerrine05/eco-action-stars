import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, activityType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!imageUrl || !activityType) {
      return new Response(JSON.stringify({ error: "imageUrl and activityType are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the image and convert to base64 data URL so the model can actually SEE it
    let imageDataUrl = imageUrl;
    try {
      const imgResp = await fetch(imageUrl);
      if (!imgResp.ok) throw new Error(`Failed to fetch image: ${imgResp.status}`);
      const contentType = imgResp.headers.get("content-type") || "image/jpeg";
      // Skip videos — model only supports images
      if (contentType.startsWith("video")) {
        return new Response(JSON.stringify({
          is_valid: false,
          confidence: 0,
          feedback: "Video submissions require manual review.",
          recommended_status: "pending",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const buf = new Uint8Array(await imgResp.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
      const base64 = btoa(binary);
      imageDataUrl = `data:${contentType};base64,${base64}`;
    } catch (e) {
      console.error("Image fetch failed:", e);
      return new Response(JSON.stringify({
        is_valid: false,
        confidence: 0,
        feedback: "Could not load the uploaded image for verification.",
        recommended_status: "pending",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are a strict image verification system for an environmental rewards platform.
You ONLY approve submissions when the image is an ORIGINAL photo personally taken by the user AND clearly shows the claimed environmental activity in the real world.

ORIGINALITY CHECK (do this FIRST — reject immediately if any sign):
- Screenshot indicators: visible browser chrome, URL bars, status bars (battery/wifi/time), app UI, search result thumbnails, watermarks (Getty, Shutterstock, Alamy, iStock, Adobe Stock, Unsplash, Pexels, etc.), website logos, "related images" strips, Google Images layout, Pinterest UI, social media UI (likes, captions, usernames).
- Stock photo indicators: overly perfect lighting/composition, professional studio quality, model-like posing, generic "smiling person with shovel" compositions, sterile backgrounds, copyright text.
- AI-generated indicators: unnatural hands/fingers, warped text, plastic skin, impossible physics, surreal lighting, hallucinated details.
- Reused/web-sourced indicators: low resolution with compression artifacts typical of re-saved web images, mismatched aspect ratios suggesting cropping from a larger image, visible JPEG artifacts around edges.
- If the image looks like it was downloaded from the internet rather than freshly captured on a phone camera — REJECT.

ACTIVITY CHECK (only if originality passes):
- Image must clearly show the specific claimed activity being performed.
- Must look like a candid, authentic, user-captured moment (phone camera angle, natural lighting, imperfect framing is GOOD).

Decision rules:
- Any originality red flag → "rejected" with confidence ≤ 0.2 and feedback explaining what you detected (e.g. "Appears to be a screenshot from Google Images" or "Has Shutterstock watermark").
- Original but doesn't clearly show activity → "rejected".
- Original AND clearly shows activity → "verified".
- Original, plausible, but ambiguous → "pending".
- Default to "rejected" when in doubt. Be strict.`;

    const userPrompt = `Claimed activity: "${activityType}"

Examine the attached image carefully. FIRST determine if it is an original photo taken by the user (not a screenshot, stock photo, AI-generated image, or image downloaded from the web). THEN check if it shows the claimed activity. Call the verify_submission tool with your decision and explain in feedback what originality signals you observed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verify_submission",
              description: "Return verification results for the submitted image",
              parameters: {
                type: "object",
                properties: {
                  is_valid: { type: "boolean", description: "Whether the image clearly shows the claimed activity" },
                  confidence: { type: "number", description: "Confidence score from 0.0 to 1.0" },
                  feedback: { type: "string", description: "Brief 1-2 sentence explanation of what you see and why you accepted/rejected it" },
                  recommended_status: { type: "string", enum: ["verified", "rejected", "pending"] },
                },
                required: ["is_valid", "confidence", "feedback", "recommended_status"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_submission" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI verification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let result = { is_valid: false, confidence: 0.3, feedback: "Unable to verify image content.", recommended_status: "pending" };
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse AI response");
      }
    }

    console.log("Verification result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-submission error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
