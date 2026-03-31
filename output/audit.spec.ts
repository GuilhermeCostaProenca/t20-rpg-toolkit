import { test } from 'playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:3001';
const OUT_DIR = path.resolve('output/audit-artifacts');

function sanitize(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 80);
}

test('deep product audit crawl', async ({ page }) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const findings: any = {
    startedAt: new Date().toISOString(),
    pages: [],
    console: [],
    pageErrors: []
  };

  page.on('console', msg => {
    findings.console.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    findings.pageErrors.push({ message: String(err.message || err) });
  });

  const visited = new Set<string>();
  const queue: string[] = ['/'];

  while (queue.length) {
    const route = queue.shift()!;
    if (visited.has(route)) continue;
    visited.add(route);

    const url = new URL(route, BASE).toString();
    let status: number | null = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      status = resp?.status() ?? null;
    } catch (e: any) {
      findings.pages.push({ route, url, error: e.message, status: null });
      continue;
    }

    await page.waitForTimeout(600);

    const pageData = await page.evaluate(() => {
      const getText = (el: Element | null) => (el?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180);
      const h1 = getText(document.querySelector('h1'));
      const h2s = Array.from(document.querySelectorAll('h2')).slice(0, 8).map(el => getText(el));
      const buttons = Array.from(document.querySelectorAll('button,[role="button"],a[role="button"]')).slice(0, 40).map((el) => ({
        text: getText(el),
        disabled: (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true',
        type: (el as HTMLButtonElement).type || null
      }));
      const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 120).map((a) => ({
        text: getText(a),
        href: (a as HTMLAnchorElement).getAttribute('href') || ''
      }));
      const forms = Array.from(document.querySelectorAll('form')).map((f, idx) => {
        const inputs = Array.from(f.querySelectorAll('input,textarea,select')).map((i) => ({
          tag: i.tagName.toLowerCase(),
          type: (i as HTMLInputElement).type || null,
          name: (i as HTMLInputElement).name || null,
          id: (i as HTMLInputElement).id || null,
          placeholder: (i as HTMLInputElement).placeholder || null,
          required: (i as HTMLInputElement).required || false
        }));
        return { idx, inputsCount: inputs.length, inputs };
      });

      const emptyHints = Array.from(document.querySelectorAll('p,div,span')).map(el => getText(el)).filter(Boolean).filter(t =>
        /nenhum|vazio|empty|nothing|sem dados|no data|nao encontrado|não encontrado|comece|inicie/i.test(t)
      ).slice(0, 20);

      return {
        title: document.title,
        h1,
        h2s,
        buttons,
        links,
        forms,
        emptyHints,
        bodyTextSample: getText(document.body)
      };
    });

    const shot = path.join(OUT_DIR, `${sanitize(route || 'home')}.png`);
    await page.screenshot({ path: shot, fullPage: true });

    findings.pages.push({
      route,
      url,
      status,
      screenshot: shot,
      ...pageData
    });

    for (const l of pageData.links) {
      if (!l.href) continue;
      if (l.href.startsWith('http') && !l.href.startsWith(BASE)) continue;
      if (l.href.startsWith('#') || l.href.startsWith('mailto:') || l.href.startsWith('tel:')) continue;
      let next = l.href;
      if (next.startsWith(BASE)) next = next.replace(BASE, '') || '/';
      if (!next.startsWith('/')) continue;
      if (!visited.has(next) && !queue.includes(next)) queue.push(next);
    }
  }

  const actionRoutes = Array.from(visited).slice(0, 20);

  for (const route of actionRoutes) {
    const url = new URL(route, BASE).toString();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(400);

      const candidateTexts = [
        'Criar', 'Novo', 'Adicionar', 'Create', 'New', 'Salvar', 'Save', 'Continuar', 'Editar', 'Edit'
      ];

      for (const text of candidateTexts) {
        const target = page.getByRole('button', { name: new RegExp(text, 'i') }).first();
        if (await target.count()) {
          const visible = await target.isVisible().catch(() => false);
          if (!visible) continue;
          await target.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(500);

          const modalOrError = await page.evaluate(() => {
            const dialogs = Array.from(document.querySelectorAll('[role="dialog"], .modal, [data-state="open"]')).length;
            const errors = Array.from(document.querySelectorAll('p,div,span')).map(el => (el.textContent || '').trim()).filter(t =>
              /erro|error|obrigat|required|inválid|invalid|falha|failed/i.test(t)
            ).slice(0, 8);
            return { dialogs, errors };
          });

          findings.pages.push({
            route,
            actionAttempt: text,
            afterClickUrl: page.url(),
            modalOrError
          });

          const actionShot = path.join(OUT_DIR, `${sanitize(route)}_action_${sanitize(text)}.png`);
          await page.screenshot({ path: actionShot, fullPage: true }).catch(() => {});
        }
      }
    } catch (e: any) {
      findings.pages.push({ route, actionPassError: e.message });
    }
  }

  findings.finishedAt = new Date().toISOString();
  const jsonPath = path.join(OUT_DIR, 'audit-findings.json');
  fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2), 'utf-8');
  console.log('AUDIT_JSON', jsonPath);
});
