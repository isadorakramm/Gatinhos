export interface Receita {
  od_esferico:   string | null;
  od_cilindrico: string | null;
  od_eixo:       string | null;
  oe_esferico:   string | null;
  oe_cilindrico: string | null;
  oe_eixo:       string | null;
  adicao:        string | null;
  dnp:           string | null;
}

export function parseReceita(texto: string): Receita {
  const resultado: Receita = {
    od_esferico: null, od_cilindrico: null, od_eixo: null,
    oe_esferico: null, oe_cilindrico: null, oe_eixo: null,
    adicao: null, dnp: null,
  };

  // ── Pré-processamento ─────────────────────────────────────────────────────

  let t = texto.toUpperCase();

  // 1. Remove "/" espúrio antes de dígitos: /80 → 80, /1 → 1
  t = t.replace(/\/(\d)/g, '$1');

  // 2. Normaliza números sem ponto decimal que o OCR colapsa:
  //    -200 → -2.00  |  -175 → -1.75  |  +325 → +3.25
  //    Só aplica quando há sinal ([+-]) antes — eixos como 180 não têm sinal
  t = t.replace(/([+-])(\d)(\d{2})(?!\d)/g, '$1$2.$3');

  // 3. Separa números merged: +3.25-2.00 → +3.25 -2.00
  t = t.replace(/([+-]\d{1,2}\.\d{2})(?=[+-])/g, '$1 ');

  // ── Helpers ───────────────────────────────────────────────────────────────

  const NUM_RE = /([+-]?\d{1,2}\.\d{2})/g;

  function extrairNums(s: string): string[] {
    return [...s.matchAll(NUM_RE)].map(m => m[1]);
  }

  function extrairEixo(s: string): string | null {
    // Remove números com decimal para não confundir com eixo
    const semDecimals = s.replace(/[+-]?\d{1,2}\.\d{2}/g, '');
    const matches = [...semDecimals.matchAll(/\b(\d{1,3})\b/g)]
      .map(m => parseInt(m[1]))
      .filter(n => n >= 1 && n <= 180);
    return matches.length > 0 ? String(matches[matches.length - 1]) : null;
  }

  const linhas = t.split(/\n/).map(l => l.trim()).filter(Boolean);

  // ── Estratégia 1: OD/OE e números na mesma linha ─────────────────────────

  for (const linha of linhas) {
    const nums = extrairNums(linha);
    if (nums.length < 2) continue;

    if (/O\.?D/.test(linha) && !resultado.od_esferico) {
      resultado.od_esferico   = nums[0];
      resultado.od_cilindrico = nums[1];
      resultado.od_eixo       = extrairEixo(linha);
    }
    if (/O\.?E/.test(linha) && !resultado.oe_esferico) {
      resultado.oe_esferico   = nums[0];
      resultado.oe_cilindrico = nums[1];
      resultado.oe_eixo       = extrairEixo(linha);
    }
  }

  // ── Estratégia 2: OD/OE sozinho numa linha → busca backward pelo label ──
  //    Pega cada linha com 2+ números e olha para trás para achar OD ou OE

  if (!resultado.od_esferico || !resultado.oe_esferico) {
    for (let i = 0; i < linhas.length; i++) {
      const nums = extrairNums(linhas[i]);
      if (nums.length < 2) continue;

      // Procura o label mais próximo ANTES dessa linha
      let label: 'OD' | 'OE' | null = null;
      for (let j = i - 1; j >= 0; j--) {
        if (/^O\.?D\.?$/.test(linhas[j])) { label = 'OD'; break; }
        if (/^O\.?E\.?$/.test(linhas[j])) { label = 'OE'; break; }
      }

      // Eixo pode estar nas próximas linhas após os números
      const blocoEixo = linhas.slice(i, i + 6).join(' ');
      const eixo = extrairEixo(blocoEixo);

      if (label === 'OD' && !resultado.od_esferico) {
        resultado.od_esferico   = nums[0];
        resultado.od_cilindrico = nums[1];
        resultado.od_eixo       = eixo;
      } else if (label === 'OE' && !resultado.oe_esferico) {
        resultado.oe_esferico   = nums[0];
        resultado.oe_cilindrico = nums[1];
        resultado.oe_eixo       = eixo;
      }
    }
  }

  // ── Estratégia 3: fallback — pega todos os números em ordem ──────────────

  if (!resultado.od_esferico && !resultado.oe_esferico) {
    const nums  = extrairNums(t);
    const eixos = [...t.matchAll(/\b(\d{1,3})\b/g)]
      .map(m => m[1])
      .filter(n => { const v = parseInt(n); return v >= 1 && v <= 180; });

    if (nums[0]) resultado.od_esferico   = nums[0];
    if (nums[1]) resultado.od_cilindrico = nums[1];
    if (eixos[0]) resultado.od_eixo      = eixos[0];
    if (nums[2]) resultado.oe_esferico   = nums[2];
    if (nums[3]) resultado.oe_cilindrico = nums[3];
    if (eixos[1]) resultado.oe_eixo      = eixos[1];
  }

  // ── Adição ────────────────────────────────────────────────────────────────

  const addMatch = t.match(/AD[ID]\.?\s*([+-]?\d{1,2}\.\d{2})/);
  if (addMatch) resultado.adicao = addMatch[1];

  // ── DNP / D.P. ────────────────────────────────────────────────────────────

  const dnpMatch = t.match(/D\.?[NP]\.?\s*(\d{2,3})/);
  if (dnpMatch) resultado.dnp = dnpMatch[1];

  return resultado;
}
