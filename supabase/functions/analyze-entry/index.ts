import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  symptoms: string[];
  mood: string;
  severity: "low" | "medium" | "high";
  summary: string;
  confidence: number; // 0..1
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_AI_API_KEY secret" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text } = await req.json().catch(() => ({ text: "" }));
    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'text' is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a medical note analyzer. Read the patient's free-text note below and extract structured insights.

Return ONLY strict JSON (no markdown, no code fences) with this shape:
{
  "symptoms": string[] (3-8 concise symptoms),
  "mood": string (short phrase),
  "severity": "low" | "medium" | "high",
  "summary": string (1-2 sentences plain English),
  "confidence": number (0..1 with 2 decimals)
}

Important:
- Infer symptoms from the text; do not invent unrelated facts.
- Choose severity based on urgency and intensity indicated by the text.
- Keep summary factual and concise.
- confidence is your overall certainty (0..1).

Patient note:
"""
${text}
"""`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return new Response(
        JSON.stringify({ error: "Gemini API failed", details: err }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const textPart: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textPart) {
      return new Response(
        JSON.stringify({ error: "No content returned from Gemini" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: AnalysisResult | null = null;
    try {
      // Try direct JSON parse first
      parsed = JSON.parse(textPart);
    } catch (_) {
      // Fallback: extract JSON substring
      const start = textPart.indexOf("{");
      const end = textPart.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = textPart.slice(start, end + 1);
        parsed = JSON.parse(jsonStr);
      }
    }

    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI output", raw: textPart }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize and validate
    const result: AnalysisResult = {
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.slice(0, 8).map((s) => String(s)).filter(Boolean) : [],
      mood: String(parsed.mood || "unknown"),
      severity: ["low", "medium", "high"].includes(parsed.severity) ? parsed.severity : "medium",
      summary: String(parsed.summary || "No summary"),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.8))),
    } as AnalysisResult;

    return new Response(JSON.stringify({ analysis: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-entry function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});