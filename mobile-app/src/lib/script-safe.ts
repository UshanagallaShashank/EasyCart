// Puts a value inside a <script> in a web page we build ourselves (the map, the payment page).
// A "<" can never close the script early, so a shop name or any other text cannot break out of it.
export function forScript(value: unknown): string {
  return JSON.stringify(value).split('<').join('\\u003c');
}
