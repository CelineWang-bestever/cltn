const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number.parseInt(process.env.PORT || '9018', 10);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
};

function sendJson(res, statusCode, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (d) => chunks.push(d));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

function escapeIdPart(text) {
    const raw = String(text || '')
        .trim()
        .toLowerCase()
        .replace(/[\s/\\>]+/g, '-')
        .replace(/[^a-z0-9\u4e00-\u9fff-_]+/g, '');
    return raw || 'item';
}

function buildDataMdContent(data) {
    const json = JSON.stringify(data, null, 2);
    return [
        '# 2026-06 Research Features (Data)',
        '',
        '```json',
        json,
        '```',
        ''
    ].join('\n');
}

function extractJsonBlockFromMd(mdText) {
    const text = String(mdText || '');
    const start = text.indexOf('```json');
    if (start < 0) return null;
    const afterStart = text.indexOf('\n', start);
    if (afterStart < 0) return null;
    const end = text.indexOf('```', afterStart + 1);
    if (end < 0) return null;
    const jsonText = text.slice(afterStart + 1, end).trim();
    if (!jsonText) return null;
    return jsonText;
}

function parseSourceMdToData(sourceMd) {
    const lines = String(sourceMd || '').split(/\r?\n/);
    const ignoredTop = new Set(['调研记录', 'UI设计']);
    let h1 = '';
    let h2 = '';
    let h3 = '';
    let module = '';
    const features = [];

    function currentModule() {
        const parts = [h1, h2, h3].filter(Boolean);
        const mod = parts.join(' > ').trim();
        if (!mod) return '';
        return mod;
    }

    function isTopLevelHeading(line) {
        const m = line.match(/^#\s+(.+)\s*$/);
        return m ? m[1].trim() : '';
    }

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const top = isTopLevelHeading(line);
        if (top) {
            h1 = top;
            h2 = '';
            h3 = '';
            module = ignoredTop.has(h1) ? '' : currentModule();
            i += 1;
            continue;
        }
        const m2 = line.match(/^##\s+(.+)\s*$/);
        if (m2) {
            h2 = m2[1].trim();
            h3 = '';
            module = ignoredTop.has(h1) ? '' : currentModule();
            i += 1;
            continue;
        }
        const m3 = line.match(/^###\s+(.+)\s*$/);
        if (m3) {
            h3 = m3[1].trim();
            module = ignoredTop.has(h1) ? '' : currentModule();
            i += 1;
            continue;
        }

        const item = line.match(/^\s*\d+\.\s+(.+)\s*$/);
        if (item && module) {
            const titleRaw = item[1].trim();
            const title = titleRaw;
            const originalItems = [];
            let j = i + 1;
            while (j < lines.length) {
                const nl = lines[j];
                if (/^#\s+/.test(nl) || /^##\s+/.test(nl) || /^###\s+/.test(nl)) break;
                if (/^\s*\d+\.\s+/.test(nl) && !/^\s{2,}\d+\.\s+/.test(nl)) break;
                if (nl.trim()) originalItems.push(nl.trim());
                j += 1;
            }

            const id = escapeIdPart(module) + '-' + escapeIdPart(title).slice(0, 50) + '-' + String(features.length + 1);
            features.push({
                id,
                module,
                priority: '',
                status: '',
                title,
                summary: '',
                originalItems,
                openQuestions: [],
                remark: ''
            });

            i = j;
            continue;
        }

        i += 1;
    }

    return {
        meta: {
            schemaVersion: 1,
            title: '2026-06 调研结论 & 功能建议',
            sourceLinks: [
                { label: '调研文字记录1', url: '' },
                { label: '调研文字记录2', url: '' }
            ],
            updatedAt: new Date().toISOString()
        },
        features
    };
}

async function ensureResearchDataFile(dataPath, sourcePath) {
    try {
        const existing = await fs.promises.readFile(dataPath, 'utf8');
        const jsonText = extractJsonBlockFromMd(existing);
        if (jsonText) return;
    } catch (e) {}

    const sourceMd = await fs.promises.readFile(sourcePath, 'utf8');
    const data = parseSourceMdToData(sourceMd);
    const content = buildDataMdContent(data);
    await fs.promises.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.promises.writeFile(dataPath, content, 'utf8');
}

async function handleApi(req, res, pathname) {
    const dataPath = path.resolve(ROOT_DIR, 'new-order-design', '2026-06-research-features.data.md');
    const sourcePath = path.resolve(ROOT_DIR, 'new-order-design', '2026-06-research-features.md');

    if (pathname === '/api/research-features/load' && req.method === 'GET') {
        await ensureResearchDataFile(dataPath, sourcePath);
        const md = await fs.promises.readFile(dataPath, 'utf8');
        const jsonText = extractJsonBlockFromMd(md);
        if (!jsonText) return sendJson(res, 500, { ok: false, error: 'Missing json block' });
        const data = JSON.parse(jsonText);
        return sendJson(res, 200, { ok: true, data });
    }

    if (pathname === '/api/research-features/save' && req.method === 'POST') {
        const body = await readBody(req);
        const parsed = JSON.parse(body || '{}');
        const data = parsed && parsed.data ? parsed.data : null;
        if (!data || typeof data !== 'object') return sendJson(res, 400, { ok: false, error: 'Invalid payload' });

        if (!data.meta || typeof data.meta !== 'object') data.meta = {};
        data.meta.schemaVersion = 1;
        data.meta.updatedAt = new Date().toISOString();

        const nextContent = buildDataMdContent(data);
        const tmpPath = dataPath + '.tmp';
        await fs.promises.writeFile(tmpPath, nextContent, 'utf8');
        await fs.promises.rename(tmpPath, dataPath);
        return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { ok: false, error: 'Not found' });
}

const server = http.createServer((req, res) => {
    let pathname = '/';
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        pathname = decodeURIComponent(url.pathname || '/');
    } catch {
        pathname = '/';
    }

    if (pathname.startsWith('/api/')) {
        handleApi(req, res, pathname).catch((err) => {
            sendJson(res, 500, { ok: false, error: String(err && err.message ? err.message : err) });
        });
        return;
    }

    if (pathname === '/') pathname = '/index.html';
    const relativePath = pathname.replace(/^\/+/, '');
    const filePath = path.resolve(ROOT_DIR, relativePath);
    if (!filePath.startsWith(path.resolve(ROOT_DIR))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
});
