import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const contractDir = dirname(fileURLToPath(import.meta.url));
const projectDir = dirname(contractDir);
const source = await readFile(join(projectDir, 'index.html'), 'utf8');
const contract = JSON.parse(await readFile(join(contractDir, 'contract.json'), 'utf8'));
const failures = [];
const notices = [];

const sha256 = value => createHash('sha256').update(value).digest('hex');
const assert = (condition, message) => { if (!condition) failures.push(message); };

function balanced(sourceText, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = start; i < sourceText.length; i += 1) {
    const char = sourceText[i];
    const next = sourceText[i + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (char === "'" || char === '"' || char === '`') { quote = char; continue; }
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, i + 1);
    }
  }
  throw new Error(`Bloco não balanceado iniciado em ${start}`);
}

function rawConstArray(name) {
  const declaration = source.indexOf(`const ${name} =`);
  const start = source.indexOf('[', declaration);
  assert(declaration >= 0 && start >= 0, `Array ${name} não encontrado.`);
  return balanced(source, start, '[', ']');
}

function between(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0, `Marcador inicial não encontrado: ${startMarker}`);
  assert(end >= 0, `Marcador final não encontrado: ${endMarker}`);
  return source.slice(start, end);
}

const currentSourceHash = sha256(source);
if (currentSourceHash !== contract.source.sha256) {
  notices.push(`O hash integral de index.html mudou: ${currentSourceHash}`);
}

const markupOnly = source.replace(/<script\b[\s\S]*?<\/script>/gi, '');
const ids = [...markupOnly.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert(JSON.stringify(ids) === JSON.stringify(contract.htmlIds.values), 'A lista ou ordem dos IDs estáticos mudou.');
assert(new Set(ids).size === ids.length, 'Existem IDs estáticos duplicados.');

const navigation = [...source.matchAll(/\bdata-view="([^"]+)"/g)].map(match => ({
  dataView: match[1],
  panelId: `view-${match[1]}`,
  panelExists: ids.includes(`view-${match[1]}`)
}));
assert(JSON.stringify(navigation) === JSON.stringify(contract.navigation), 'data-view ou correspondência com painéis mudou.');

for (const entry of contract.storage.localStorage.filter(item => !item.dynamic)) {
  assert(source.includes(entry.key), `Chave de localStorage ausente: ${entry.key}`);
}
for (const value of Object.values(contract.storage.indexedDB)) {
  if (typeof value === 'string') assert(source.includes(value), `Identificador IndexedDB ausente: ${value}`);
}
assert(source.includes('window.RFStorage'), 'Exposição window.RFStorage ausente.');
assert(source.includes('__RF_ASSISTANT_CLEANUP__'), 'Exposição de limpeza do bookmarklet ausente.');

const bookmarkStart = source.indexOf('function bookmarkletCode()');
const bookmarkBrace = source.indexOf('{', bookmarkStart);
const bookmark = `function bookmarkletCode() ${balanced(source, bookmarkBrace, '{', '}')}`;
assert(sha256(bookmark) === contract.frozen.bookmarkletCode.sha256, 'bookmarkletCode() mudou.');
assert((source.match(/RF_SYNC_V2:/g) || []).length === contract.frozen.syncPrefix.occurrences, 'Quantidade de RF_SYNC_V2: mudou.');

const sourceBlocks = {
  bankHighlightsArray: rawConstArray('DESTAQUE'),
  banksArray: rawConstArray('TODOS'),
  occurrencesArray: rawConstArray('OCORRENCIAS'),
  jiraPanel: between('<!-- PAINEL 2: GUIA DO JIRA -->', '<!-- PAINEL 3: CÓDIGOS DOS BANCOS -->'),
  assistantSetup: between('<details class="assistant-setup">', '</header>'),
  backupModule: between('<!-- SCRIPT 0: PERSISTENCIA UNIFICADA', '<!-- SCRIPT 1: NAVEGAÇÃO E GESTÃO DE MACROS -->'),
  saldoModule: between('<!-- SCRIPT 5: SALDO DEVEDOR', '<!-- SCRIPT DE TEMAS -->'),
  pontoModule: between('<!-- SCRIPT 2: CONTROLE DE PONTO -->', '<!-- SCRIPT 3: CÓDIGOS DOS BANCOS -->')
};
for (const [name, value] of Object.entries(sourceBlocks)) {
  const expectedHash = contract.frozenSourceBlocks[name].sha256;
  const rawMatches = sha256(value) === expectedHash;
  const normalizedLfMatches = sha256(value.replace(/\r\n/g, '\n')) === expectedHash;
  assert(rawMatches || normalizedLfMatches, `Bloco congelado mudou: ${name}`);
}

const supabaseUrl = source.match(/supabaseUrl:\s*'([^']+)'/)?.[1] || '';
const supabaseKey = source.match(/supabaseAnonKey:\s*'([^']+)'/)?.[1] || '';
assert(sha256(supabaseUrl) === contract.supabase.url.sha256, 'Configuração URL do Supabase mudou.');
assert(sha256(supabaseKey) === contract.supabase.anonKey.sha256, 'Chave configurada do Supabase mudou.');

const staticContent = JSON.parse(await readFile(join(contractDir, contract.staticContent.file), 'utf8'));
assert(sha256(JSON.stringify(staticContent)) === contract.staticContent.sha256, 'Snapshot de conteúdo estático foi modificado.');

for (const [folder, files] of [['expected', contract.expected], ['visual', contract.visual]]) {
  for (const [filename, metadata] of Object.entries(files)) {
    const bytes = await readFile(join(contractDir, folder, filename));
    assert(sha256(bytes) === metadata.sha256, `Evidência modificada: ${folder}/${filename}`);
  }
}

if (notices.length) {
  console.log('Informações:');
  notices.forEach(message => console.log(`- ${message}`));
}

if (failures.length) {
  console.error('Contrato divergente:');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('Contrato técnico preservado.');
  console.log(`IDs estáticos: ${ids.length}`);
  console.log(`Bookmarklet SHA-256: ${contract.frozen.bookmarkletCode.sha256}`);
  console.log(`Conteúdo estático SHA-256: ${contract.staticContent.sha256}`);
}
