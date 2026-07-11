import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        { error: "Röntgen dosyası yüklenmedi." },
        { status: 400 }
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const workspace = process.env.ROBOFLOW_WORKSPACE;
    const workflow = process.env.ROBOFLOW_WORKFLOW;
    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!workspace || !workflow || !apiKey) {
      return NextResponse.json(
        { error: "Roboflow environment ayarları eksik." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://serverless.roboflow.com/infer/workflows/${workspace}/${workflow}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: apiKey,
          inputs: {
            image: {
              type: "base64",
              value: base64Image
            }
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Roboflow analizi başarısız.", details: result },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Sunucu hatası.",
        details: error?.message ?? String(error)
      },
      { status: 500 }
    );
  }
}

