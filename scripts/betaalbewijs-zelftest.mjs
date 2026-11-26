/**
 * De bytecontrole uit de echte route testen, niet een kopie ervan.
 *
 * Het BEELDSOORTEN-blok wordt uit route.ts geknipt en uitgevoerd, zodat deze
 * test faalt zodra iemand de predicaten in de route verandert.
 */
import fs from "fs";

const bron = fs.readFileSync(
  new URL("../src/app/api/payment-screenshot/route.ts", import.meta.url), "utf8");

const begin = bron.indexOf("const BEELDSOORTEN");
const eind = bron.indexOf("];", begin) + 2;
if (begin < 0 || eind < 2) throw new Error("BEELDSOORTEN-blok niet gevonden");
const blok = bron.slice(begin, eind).replace(/: Buffer/g, "");
const BEELDSOORTEN = eval(blok + "; BEELDSOORTEN");
console.log(`${BEELDSOORTEN.length} soorten uit de route geladen\n`);

const bepaal = (b) => BEELDSOORTEN.find((s) => s.past(b))?.type ?? null;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40, 1)]);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(40, 1)]);
const webp = Buffer.concat([
  Buffer.from("RIFF", "ascii"), Buffer.from([0x24, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"), Buffer.alloc(40, 1)]);

const gevallen = [
  ["echte PNG",                      png,  "image/png"],
  ["echte JPEG",                     jpeg, "image/jpeg"],
  ["echte WebP",                     webp, "image/webp"],
  // Dit is waar het om begon: een uitvoerbaar bestand dat zich als plaatje
  // voordoet. De browser kan "image/png" meesturen; de bytes liegen niet.
  ["Windows .exe (MZ-header)",       Buffer.concat([Buffer.from("MZ\x90\x00", "binary"), Buffer.alloc(60, 0)]), null],
  ["Linux ELF",                      Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46]), Buffer.alloc(60, 0)]), null],
  ["ZIP of docx (PK)",               Buffer.concat([Buffer.from("PK\x03\x04", "binary"), Buffer.alloc(60, 0)]), null],
  ["PDF",                            Buffer.from("%PDF-1.7\n%aaaa\n" + "x".repeat(40)), null],
  ["SVG met script",                 Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), null],
  ["HTML-pagina",                    Buffer.from("<!DOCTYPE html><html><body><script>alert(1)</script>"), null],
  ["EICAR-testvirus",                Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'), null],
  ["PHP-webshell",                   Buffer.from('<?php system($_GET["c"]); ?>' + "x".repeat(40)), null],
  ["leeg bestand",                   Buffer.alloc(0), null],
  ["drie bytes",                     Buffer.from([0xff, 0xd8, 0xff]), null],
  // RIFF zonder WEBP is bijvoorbeeld een wav-bestand.
  ["RIFF maar geen WEBP (wav)",      Buffer.concat([Buffer.from("RIFF", "ascii"), Buffer.alloc(4, 0), Buffer.from("WAVE", "ascii"), Buffer.alloc(40, 0)]), null],
  // En het omgekeerde: een echt plaatje waarvan de browser liegt dat het een
  // exe is, moet er juist wel door. De route gebruikt de gevonden soort.
  ["echte PNG, header liegt",        png,  "image/png"],
];

let fout = 0;
for (const [naam, buf, verwacht] of gevallen) {
  const uit = bepaal(buf);
  const goed = uit === verwacht;
  if (!goed) fout++;
  console.log(`${goed ? "ok  " : "FOUT"} ${naam.padEnd(30)} -> ${uit ?? "geweigerd"}${goed ? "" : `  (verwacht ${verwacht ?? "geweigerd"})`}`);
}
console.log(fout === 0 ? "\nalle gevallen goed" : `\n${fout} gevallen FOUT`);
process.exit(fout === 0 ? 0 : 1);
