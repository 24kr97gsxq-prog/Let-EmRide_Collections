// Text message library, English and Spanish, written side by side so the
// Spanish is not a machine translation of the English — it is how you'd say
// it on the phone. Edit freely; the placeholders are filled at render time.
//
// Placeholders: {first} {collector} {amt} {due} {dpd} {vehicle} {payoff}
//               {lot} {pamt} {pdate} {cure}

export const MESSAGES = [
  {
    id: "m1", stage: "1–4 days", title: "Courtesy reminder",
    en: `Hi {first}, this is {collector} at Let 'Em Ride Autos. Your {amt} payment was due {due} on the {vehicle}. You can pay online, call us at {lot}, or come by the lot. If you've already paid, thank you — just reply PAID. Reply STOP to end texts.`,
    es: `Hola {first}, le habla {collector} de Let 'Em Ride Autos. Su pago de {amt} venció el {due} por el {vehicle}. Puede pagar en línea, llamarnos al {lot}, o pasar por el lote. Si ya pagó, gracias — responda PAGADO. Responda STOP para no recibir mensajes.`,
  },
  {
    id: "m2", stage: "5–9 days", title: "Firm — ask for a date",
    en: `{first}, {collector} at Let 'Em Ride. Your account is {dpd} days past due — {amt} plus late fee. I need a payment date from you today. Call or text me back at {lot} and I'll write it down. Reply STOP to end texts.`,
    es: `{first}, le habla {collector} de Let 'Em Ride. Su cuenta tiene {dpd} días de atraso — {amt} más el cargo por mora. Necesito que me dé una fecha de pago hoy. Llámeme o mándeme mensaje al {lot} y lo anoto. Responda STOP para no recibir mensajes.`,
  },
  {
    id: "m3", stage: "10–19 days", title: "Late fee + arrangement offer",
    en: `{first}, this is {collector} at Let 'Em Ride Autos. You're {dpd} days behind. Interest is adding up every single day on this contract, so the longer it sits the more it costs you. If you can't pay the full {amt}, call me at {lot} — we may be able to set up an arrangement. I'd rather work it out with you.`,
    es: `{first}, le habla {collector} de Let 'Em Ride Autos. Tiene {dpd} días de atraso. El interés se acumula todos los días en este contrato, así que entre más tiempo pase, más le cuesta. Si no puede pagar los {amt} completos, llámeme al {lot} — tal vez podamos hacer un arreglo. Prefiero resolverlo con usted.`,
  },
  {
    id: "m4", stage: "20–29 days", title: "Before default action",
    en: `{first} — {collector} at Let 'Em Ride Autos. Your account is {dpd} days past due and moving toward default. Your written notice went out by certified mail. Please call me at {lot} today so we can keep you in the {vehicle}. Payoff on the account today is {payoff}.`,
    es: `{first} — le habla {collector} de Let 'Em Ride Autos. Su cuenta tiene {dpd} días de atraso y va camino al incumplimiento. Su aviso por escrito se envió por correo certificado. Por favor llámeme hoy al {lot} para que pueda quedarse con el {vehicle}. El pago total de la cuenta hoy es {payoff}.`,
  },
  {
    id: "m5", stage: "30+ SKIP", title: "Skip / locate — last contact attempt",
    en: `{first}, this is {collector} at Let 'Em Ride Autos. We have not been able to reach you and your account is {dpd} days past due. Your certified notice was mailed and the cure date is {cure}. Call me at {lot} today. If you can't keep the vehicle, we can arrange a voluntary surrender — that is usually better for you than the alternative.`,
    es: `{first}, le habla {collector} de Let 'Em Ride Autos. No hemos podido comunicarnos con usted y su cuenta tiene {dpd} días de atraso. Su aviso certificado ya fue enviado y la fecha límite para ponerse al corriente es {cure}. Llámeme hoy al {lot}. Si no puede quedarse con el vehículo, podemos hacer una entrega voluntaria — normalmente eso le conviene más.`,
  },
  {
    id: "m6", stage: "Any", title: "Promise confirmation", needsPromise: true,
    en: `{first}, confirming what we agreed: {pamt} on {pdate}. I've written it down under your name. If anything changes, call me first at {lot} — don't just let the date pass. Thank you. — {collector}, Let 'Em Ride Autos`,
    es: `{first}, le confirmo lo que acordamos: {pamt} el {pdate}. Ya lo anoté a su nombre. Si algo cambia, llámeme primero al {lot} — no deje pasar la fecha. Gracias. — {collector}, Let 'Em Ride Autos`,
  },
  {
    id: "m7", stage: "Any", title: "Broken promise", needsPromise: true,
    en: `{first}, we had {pamt} set for {pdate} and it didn't come in. I need to hear from you today at {lot}. Tell me what happened and what you can do — I can't help you if you don't pick up. — {collector}`,
    es: `{first}, teníamos {pamt} programado para el {pdate} y no entró. Necesito saber de usted hoy al {lot}. Dígame qué pasó y qué puede hacer — no puedo ayudarle si no contesta. — {collector}`,
  },
  {
    id: "m8", stage: "30+", title: "Voluntary surrender offer",
    en: `{first}, this is {collector} at Let 'Em Ride Autos. If the payments have gotten away from you, you can bring the {vehicle} back to us voluntarily. Call me at {lot} and I'll walk you through exactly how it works and what it means for your balance. It's a conversation, not a fight.`,
    es: `{first}, le habla {collector} de Let 'Em Ride Autos. Si los pagos se le complicaron, puede entregarnos el {vehicle} voluntariamente. Llámeme al {lot} y le explico exactamente cómo funciona y qué pasa con su saldo. Es una conversación, no un pleito.`,
  },
  {
    id: "m9", stage: "Any", title: "Payment received", needsPromise: true,
    en: `Thank you {first} — we received {pamt} today. Your next payment of {amt} is due {due}. Appreciate you. — {collector}, Let 'Em Ride Autos`,
    es: `Gracias {first} — recibimos {pamt} hoy. Su próximo pago de {amt} vence el {due}. Se lo agradezco. — {collector}, Let 'Em Ride Autos`,
  },
  {
    id: "m10", stage: "Any", title: "Extension / deferral approved", needsPromise: true,
    en: `{first}, your extension is approved. Your next due date moves to {due} and the amount stays {amt}. Interest still accrues daily during the extension, so your payoff goes up — but you're current on the schedule. Sign the extension form before {pdate}. — {collector}`,
    es: `{first}, su extensión fue aprobada. Su próxima fecha de pago cambia al {due} y la cantidad sigue siendo {amt}. El interés se sigue acumulando diariamente durante la extensión, así que su pago total sube — pero queda al corriente con el calendario. Firme la forma de extensión antes del {pdate}. — {collector}`,
  },
];
