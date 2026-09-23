// Visor web: puente HTTP -> gRPC solo para verlo en el navegador (localhost:3100)
import http from 'node:http';
import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const def = protoLoader.loadSync(path.join(import.meta.dirname, 'src', 'productos.proto'), { keepCase: true, defaults: true });
const proto = grpc.loadPackageDefinition(def).productos;
const client = new proto.ProductoService('localhost:5000', grpc.credentials.createInsecure());

const PAGE = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Visor gRPC</title><style>
:root{--bg:#f6f7f9;--surface:#fff;--ink:#111827;--soft:#6b7280;--line:#e5e7eb;--accent:#4f46e5;--accent-soft:#eef2ff;--ok:#047857;--ok-soft:#ecfdf5;--err:#b91c1c;--err-soft:#fef2f2;--r:10px}
@media(prefers-color-scheme:dark){:root{--bg:#0e1116;--surface:#161b22;--ink:#e6edf3;--soft:#8b949e;--line:#262d36;--accent:#8b93ff;--accent-soft:#1d2140;--ok:#3fb950;--ok-soft:#12261a;--err:#f47067;--err-soft:#2d1517}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 Inter,system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px;display:grid;gap:24px}
h1{font-size:24px;margin:0;letter-spacing:-.02em}p{margin:0;color:var(--soft)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px;display:grid;gap:16px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
h2{font-size:16px;margin:0}code{font-family:ui-monospace,monospace;font-size:12px;background:var(--bg);padding:2px 8px;border-radius:6px;color:var(--soft)}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
input{height:40px;width:120px;padding:0 12px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);font:inherit}
button{height:40px;padding:0 16px;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:600 14px inherit;cursor:pointer;transition:background .15s,transform .15s}
button:hover{background:var(--bg)}button:active{transform:scale(.98)}button.primary{background:var(--accent);border-color:var(--accent);color:#fff}button.primary:hover{opacity:.9}
button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
li{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;border:1px solid var(--line);border-radius:8px;animation:in .25s ease-out}
li b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}li span{font-variant-numeric:tabular-nums;color:var(--soft)}
.empty{color:var(--soft);padding:16px;text-align:center;border:1px dashed var(--line);border-radius:8px}
.badge{font-size:12px;font-weight:600;padding:2px 10px;border-radius:99px;background:var(--ok-soft);color:var(--ok)}
.error{padding:12px 16px;border-radius:8px;background:var(--err-soft);color:var(--err);font-weight:500}
@keyframes in{from{opacity:0;transform:translateY(6px)}}@media(prefers-reduced-motion:reduce){li{animation:none}}
</style></head><body><main>
<header><h1>Visor gRPC · Productos</h1><p>Cada botón llama al microservicio NestJS en el puerto 5000 por gRPC.</p></header>
<section class="card"><div class="head"><h2>Unary</h2><code>ObtenerProducto</code></div>
<div class="row"><input id="id" type="number" value="1" aria-label="ID"><button class="primary" onclick="unary()">Obtener producto</button></div><div id="u"><div class="empty">Sin consultar todavía.</div></div></section>
<section class="card"><div class="head"><h2>Server streaming</h2><code>ListarProductos</code></div>
<div class="row"><button class="primary" onclick="stream('listar','s1')">Listar productos</button></div><div id="s1"><div class="empty">Los productos llegarán uno por uno.</div></div></section>
<section class="card"><div class="head"><h2>Reto</h2><code>BuscarPorPrecioMaximo</code></div>
<div class="row"><input id="max" type="number" value="50" aria-label="Precio máximo"><button class="primary" onclick="stream('buscar','s2',max.value)">Buscar</button></div><div id="s2"><div class="empty">Elige un precio máximo.</div></div></section>
</main><script>
const item=p=>'<li><b>'+p.id+' · '+p.nombre+'</b><span>$'+p.precio.toFixed(2)+'</span></li>';
const err=m=>'<div class="error">'+m+'</div>';
async function unary(){const r=await fetch('/api/producto/'+id.value);const j=await r.json();u.innerHTML=r.ok?'<ul>'+item(j)+'</ul>':err('gRPC '+j.code+': '+j.details)}
function stream(tipo,el,max){const box=document.getElementById(el);box.innerHTML='<ul></ul>';const ul=box.firstChild;
const es=new EventSource('/api/stream?tipo='+tipo+'&max='+(max||0));
es.onmessage=e=>ul.insertAdjacentHTML('beforeend',item(JSON.parse(e.data)));
es.addEventListener('fin',()=>{es.close();if(!ul.children.length)box.innerHTML='<div class="empty">Sin resultados.</div>';else box.insertAdjacentHTML('beforeend','<p style="margin-top:8px"><span class="badge">Streaming finalizado</span></p>')});
es.addEventListener('fallo',e=>{es.close();box.innerHTML=err(e.data||'No se pudo conectar al servidor gRPC (puerto 5000).')})}
</script></body></html>`;

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(PAGE); }
  if (url.pathname.startsWith('/api/producto/')) {
    return client.obtenerProducto({ id: Number(url.pathname.split('/').pop()) }, (err, p) => {
      res.writeHead(err ? 404 : 200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(err ? { code: err.code, details: err.details } : p));
    });
  }
  if (url.pathname === '/api/stream') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
    const call = url.searchParams.get('tipo') === 'buscar'
      ? client.buscarPorPrecioMaximo({ precioMaximo: Number(url.searchParams.get('max')) })
      : client.listarProductos({});
    call.on('data', (p) => res.write(`data: ${JSON.stringify(p)}\n\n`));
    call.on('end', () => { res.write('event: fin\ndata: ok\n\n'); res.end(); });
    call.on('error', (e) => { res.write(`event: fallo\ndata: gRPC ${e.code}: ${e.details}\n\n`); res.end(); });
    return req.on('close', () => call.cancel());
  }
  res.writeHead(404); res.end();
}).listen(3100, () => console.log('Visor en http://localhost:3100'));
