// Crea el cliente gRPC. Local por defecto; para Render: GRPC_TARGET=mi-app.onrender.com:443 (usa TLS)
import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const target = process.env.GRPC_TARGET ?? 'localhost:5000';
const seguro = target.endsWith(':443');
const def = protoLoader.loadSync(path.join(import.meta.dirname, 'src', 'productos.proto'), { keepCase: true, longs: String, enums: String, defaults: true });
const proto = grpc.loadPackageDefinition(def).productos;

export const client = new proto.ProductoService(target, seguro ? grpc.credentials.createSsl() : grpc.credentials.createInsecure());
export { target };
