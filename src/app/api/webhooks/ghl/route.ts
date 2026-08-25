import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Imprime el JSON completo en la terminal
    console.log("--- JSON RECIBIDO ---");
    console.dir(body, { depth: null, colors: true });

    return NextResponse.json(
      { message: "Payload recibido correctamente", data: body },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al procesar el body:", error);
    return NextResponse.json(
      { error: "JSON inválido o cuerpo vacío" },
      { status: 400 }
    );
  }
}