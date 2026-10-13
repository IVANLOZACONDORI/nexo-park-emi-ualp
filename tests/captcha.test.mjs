import test from 'node:test';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';const require=createRequire(new URL('../backend/package.json',import.meta.url));const jwt=require('jsonwebtoken');
import {createCaptcha,verifyCaptcha} from '../backend/src/core/autenticacion/captcha.service.js';import {env} from '../backend/src/config/env.js';
test('CAPTCHA: respuesta correcta, incorrecta y tiempo de vigencia',()=>{const c=createCaptcha();const [a,b]=c.question.match(/\d+/g).map(Number);const answer=c.question.includes('-')?a-b:a+b;assert.ok(c.expiresInSeconds>0);assert.equal(verifyCaptcha(c.token,String(answer)),true);assert.equal(verifyCaptcha(c.token,String(answer+1)),false);});
test('CAPTCHA: cero válido no permite campos vacíos ni otros tipos',()=>{const t=jwt.sign({type:'captcha',answer:0},env.captchaSecret,{expiresIn:'5m'});assert.equal(verifyCaptcha(t,'0'),true);for(const value of ['', ' ',false,null,undefined,'0x0','0.0'])assert.equal(verifyCaptcha(t,value),false);});
test('CAPTCHA: tokens vencidos, alterados o de otro tipo se rechazan',()=>{const t=jwt.sign({type:'captcha',answer:2},env.captchaSecret,{expiresIn:-1});assert.equal(verifyCaptcha(t,'2'),false);assert.equal(verifyCaptcha('invalido','2'),false);assert.equal(verifyCaptcha(jwt.sign({type:'sesion',answer:2},env.captchaSecret),'2'),false);});
import {captchaLifetime} from '../backend/src/core/autenticacion/captcha.service.js';
test('CAPTCHA: duración heredada en segundos y configuración inválida',()=>{
 for(const [value,expected] of [['300',300],['5m',300],[' 5m ',300],['1h',3600],['5 minutos',300],['0',300],['invalid',300]])assert.equal(captchaLifetime(value),expected);
 const old=env.captchaExpiresIn;
 try{for(const value of ['300','5 minutos']){env.captchaExpiresIn=value;const c=createCaptcha();assert.equal(c.expiresInSeconds,300);assert.equal(jwt.verify(c.token,env.captchaSecret).type,'captcha');}}finally{env.captchaExpiresIn=old;}
});
