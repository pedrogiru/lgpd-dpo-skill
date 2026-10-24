import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const DUAS_HORAS = 2 * 60 * 60 * 1000;
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

// Cookies de sessão e de carrinho. Sem eles o login e o carrinho não funcionam.
export function sessao(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies.sid) {
    res.cookie("sid", randomUUID(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: DUAS_HORAS,
    });
  }
  if (!req.cookies.carrinho_id) {
    res.cookie("carrinho_id", randomUUID(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SETE_DIAS,
    });
  }
  next();
}
