// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

const latestPayments = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.trim().length > 0);
for (const line of lines) {
  let event;

  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }

  if (!event.txn_id) {
    continue;
  }

   const previousEvent = latestPayments.get(event.txn_id);

  if (!previousEvent || event.ts >= previousEvent.ts) {
    latestPayments.set(event.txn_id, event);
  }
}

for (const event of latestPayments.values()) {
  if (event.status === "success") {
    total += Number(String(event.amount).replace(/,/g, "").trim());
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
