const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

console.log('=== TP : Comparaison JSON, XML et Protobuf ===\n');

// Charger la définition Protobuf depuis employee.proto
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Construire la liste d'employés
const employees = [];

employees.push({
  id: 1,
  name: 'Ali',
  salary: 9000
});

employees.push({
  id: 2,
  name: 'Kamal',
  salary: 22000
});

employees.push({
  id: 3,
  name: 'Amal',
  salary: 23000
});

// Objet racine compatible avec message Employees
let jsonObject = { employee: employees };

// ========== JSON ==========

console.log('--- JSON ---');

// Encodage JSON
console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

// Décodage JSON
console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// ========== XML ==========

console.log('\n--- XML ---');

// Options de conversion JSON -> XML
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

// Encodage XML
console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

// Décodage XML
console.time('XML decode');
// Conversion XML -> JSON (texte) -> objet JS
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// ========== Protobuf ==========

console.log('\n--- Protobuf ---');

// Vérification de conformité avec le schéma Protobuf
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) {
  throw Error(errMsg);
}

// Encodage Protobuf
console.time('Protobuf encode');
let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

// Décodage Protobuf
console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
// Optionnel : conversion vers objet JS "classique"
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// ========== Écriture des fichiers ==========

console.log('\n--- Écriture des fichiers ---');

fs.writeFileSync('data.json', jsonData);
console.log('✓ Fichier data.json créé');

fs.writeFileSync('data.xml', xmlData);
console.log('✓ Fichier data.xml créé');

fs.writeFileSync('data.proto', buffer);
console.log('✓ Fichier data.proto créé');

// ========== Mesure des tailles ==========

console.log('\n--- Comparaison des tailles ---');

const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

// ========== Calcul des pourcentages ==========

console.log('\n--- Analyse comparative ---');

const minSize = Math.min(jsonFileSize, xmlFileSize, protoFileSize);

console.log(`JSON  : ${((jsonFileSize / minSize) * 100).toFixed(1)}% de la taille de Protobuf`);
console.log(`XML   : ${((xmlFileSize / minSize) * 100).toFixed(1)}% de la taille de Protobuf`);
console.log(`Protobuf : 100% (référence)`);

console.log('\n=== Fin du TP ===');