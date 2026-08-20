// Call scripts. Same placeholders as the message library.

export const CALL_SCRIPTS = [
  {
    id: "c1", title: "Early call (1–9 days)", stage: "1–9 days",
    en: `1. "May I speak with {first}? This is {collector} calling from Let 'Em Ride Autos."
2. Confirm you have the right party. Do not discuss the account with anyone else.
3. "I'm calling about the {vehicle}. Your {amt} payment was due {due} and it hasn't come in yet."
4. STOP TALKING. Let them answer.
5. Probe: "What happened this pay period?" / "When do you get paid next?"
6. Close for a date: "So you'll pay {amt} on ____ — online, by phone, or at the lot?"
7. Read it back, then log the promise and set your next contact date.`,
    es: `1. "¿Me comunica con {first}? Le habla {collector} de Let 'Em Ride Autos."
2. Confirme que es la persona correcta. No hable de la cuenta con nadie más.
3. "Le llamo por el {vehicle}. Su pago de {amt} venció el {due} y todavía no ha entrado."
4. DEJE DE HABLAR. Deje que conteste.
5. Pregunte: "¿Qué pasó este período?" / "¿Cuándo le pagan otra vez?"
6. Cierre con una fecha: "Entonces va a pagar {amt} el ____ — ¿en línea, por teléfono, o en el lote?"
7. Repítalo, luego anote la promesa y ponga su próxima fecha de contacto.`,
  },
  {
    id: "c2", title: "Broken promise call", stage: "Any",
    en: `1. "{first}, it's {collector} at Let 'Em Ride. We had {pamt} set for {pdate}."
2. "It didn't come in. Tell me what happened." — then be quiet.
3. Do not re-negotiate down on the first ask. "What can you put down today?"
4. If they can pay part: take the money now, set the balance date before their next due date.
5. If they can't: "I have to write something down. What date are you telling me?"
6. Second broken promise = supervisor review before you grant a third.
7. Log it. A broken promise moves them to the top of the board tomorrow.`,
    es: `1. "{first}, le habla {collector} de Let 'Em Ride. Teníamos {pamt} para el {pdate}."
2. "No entró. Dígame qué pasó." — luego quédese callada.
3. No baje la cantidad en la primera petición. "¿Cuánto puede abonar hoy?"
4. Si puede pagar una parte: tome el dinero ahora y ponga fecha para el resto antes de su próximo pago.
5. Si no puede: "Tengo que anotar algo. ¿Qué fecha me está dando?"
6. Segunda promesa rota = revisión con el supervisor antes de dar una tercera.
7. Anótelo. Una promesa rota lo sube a lo más alto de la lista mañana.`,
  },
  {
    id: "c3", title: "30+ skip / locate", stage: "30+ SKIP",
    en: `Before calling: ping GPS, note last known location and time.
1. Call mobile, then work, then references — references only to ask for updated contact info. Never disclose the debt to a third party.
2. If you reach them: "{first}, I've been trying to reach you for {dpd} days. Your certified notice went out and the cure date is {cure}."
3. Give two doors: "Either we get you caught up, or we set up a voluntary surrender. Which one are we doing?"
4. If no contact after 3 attempts across 3 days: document all attempts, confirm certified notice + tracking, escalate for recovery assignment.
5. Never threaten arrest, never threaten anything you won't do, never call before 8am or after 9pm.`,
    es: `Antes de llamar: revise el GPS, anote la última ubicación conocida y la hora.
1. Llame al celular, luego al trabajo, luego a las referencias — a las referencias SOLO para pedir información de contacto actualizada. Nunca revele la deuda a terceros.
2. Si contesta: "{first}, llevo {dpd} días tratando de localizarlo. Su aviso certificado ya salió y la fecha límite es {cure}."
3. Dé dos opciones: "O lo ponemos al corriente, o hacemos una entrega voluntaria. ¿Cuál va a ser?"
4. Si no hay contacto después de 3 intentos en 3 días: documente todos los intentos, confirme el aviso certificado y el número de rastreo, y escale para asignar la recuperación.
5. Nunca amenace con arresto, nunca amenace con algo que no va a hacer, nunca llame antes de las 8am ni después de las 9pm.`,
  },
  {
    id: "c4", title: "Voluntary surrender conversation", stage: "30+",
    en: `1. "{first}, I'm not calling to fight with you. I'm calling to give you a way out."
2. Explain plainly: bring the {vehicle} to the lot, we inspect it, you sign the surrender form, you take your personal property with you.
3. Be honest about the balance: the vehicle sells, the sale proceeds go against what you owe, and there may be a remaining balance. Do not promise the balance goes away.
4. Set a date, time, and address. Write it on the account.
5. Remind them to bring both keys, sort out the plates, and empty the trunk.
6. Log surrender scheduled + tell the lot so someone is there to receive it.`,
    es: `1. "{first}, no le llamo para pelear. Le llamo para darle una salida."
2. Explique claro: trae el {vehicle} al lote, lo inspeccionamos, firma la forma de entrega, y se lleva sus pertenencias.
3. Sea honesta con el saldo: el vehículo se vende, lo que se obtenga se aplica a lo que debe, y puede quedar un saldo. No prometa que la deuda desaparece.
4. Ponga fecha, hora y dirección. Anótelo en la cuenta.
5. Recuérdele traer las dos llaves, arreglar lo de las placas, y vaciar la cajuela.
6. Registre la entrega programada y avise al lote para que alguien la reciba.`,
  },
];

export const HOUSE_RULES = [
  "Calls and texts between 8:00am and 9:00pm, customer's time. Nothing outside that window.",
  "Right party only. A reference gets asked for a phone number, never told about the debt.",
  "No threats — no arrest, no \"we're taking it tonight\" unless a unit is truly assigned.",
  "Someone says STOP: texting to that number ends. Note it on the file and switch to calls and mail.",
  "Every contact gets logged the same hour. The file is the evidence.",
  "Second broken promise goes to the owner before a third one is granted.",
];
