import jwt from 'jsonwebtoken';
import {randomInt} from 'node:crypto';
import { env } from '../../config/env.js';

// A numeric .env value means seconds; jsonwebtoken otherwise treats a numeric
// string as milliseconds. Invalid legacy values use the safe five-minute default.
export function captchaLifetime(value) {
  const match = String(value ?? '').trim().match(/^(\d+)\s*(s|m|h)?$/i);
  if (!match) return 300;
  const seconds = Number(match[1]) * ({s:1,m:60,h:3600}[(match[2] || 's').toLowerCase()]);
  return Number.isFinite(seconds) && seconds >= 30 && seconds <= 3600 ? seconds : 300;
}
export function createCaptcha() {
  const a=randomInt(2,10),b=randomInt(1,10),op=randomInt(2)?'+':'-';
  const left=op==='-'?Math.max(a,b):a,right=op==='-'?Math.min(a,b):b;
  const answer=op==='+'?left+right:left-right;
  const expiresInSeconds=captchaLifetime(env.captchaExpiresIn);
  const token=jwt.sign({answer,type:'captcha'},env.captchaSecret,{algorithm:'HS256',expiresIn:expiresInSeconds});
  return {token,question:`${left} ${op} ${right} = ?`,expiresInSeconds};
}
export function verifyCaptcha(token,answer) {
  try {
    const payload=jwt.verify(token,env.captchaSecret,{algorithms:['HS256']});
    return payload.type==='captcha' && /^\d{1,3}$/.test(String(answer).trim()) && Number(answer)===Number(payload.answer);
  } catch { return false; }
}
