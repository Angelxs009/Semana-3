import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.join(import.meta.dirname, 'src', 'productos.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true });
const proto = grpc.loadPackageDefinition(packageDef).productos;

const client = new proto.ProductoService('localhost:5000', grpc.credentials.createInsecure());

function stream(titulo, call, siguiente) {
  console.log(`\n== ${titulo} ==`);
  call.on('data', (p) => console.log(`${p.id} - ${p.nombre} - $${p.precio}  (llegó en streaming)`));
  call.on('end', () => { console.log('Streaming finalizado.'); siguiente(); });
  call.on('error', (err) => { console.error('Error en el stream:', err.code, err.details); siguiente(); });
}

console.log('== ObtenerProducto (unary) ==');
client.obtenerProducto({ id: 1 }, (err, producto) => {
  if (err) return console.error('Error gRPC:', err.code, err.details);
  console.log(`${producto.id} - ${producto.nombre} - $${producto.precio}`);

  stream('ListarProductos (server streaming)', client.listarProductos({}), () => {
    stream('BuscarPorPrecioMaximo(50) (reto)', client.buscarPorPrecioMaximo({ precioMaximo: 50 }), () => {
      console.log('\n== Prueba de error (id inexistente) ==');
      client.obtenerProducto({ id: 999 }, (err2, p) => {
        if (err2) console.log(`Error gRPC: ${err2.code} - ${err2.details}`);
        else console.log('No debería llegar aquí:', p);
      });
    });
  });
});
