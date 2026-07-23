import { NextResponse } from "next/server";

/**
 * Liveness: só confirma que o processo está respondendo, sem checar
 * dependências (banco, storage). Se esta rota não responder, o processo
 * em si está travado/caído — é o sinal para reiniciar, não para investigar.
 * Pública, sem autenticação — é infraestrutura, não painel.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
