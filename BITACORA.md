# Bitácora · Semana 3 · gRPC con NestJS

## ¿Por qué BuscarPorPrecioMaximo es server streaming y no unary?
El número de resultados es variable: depende del precio máximo enviado (con 50 devuelve 2 productos, con 200 devolvería 3). Con streaming el servidor entrega cada coincidencia apenas la tiene, sin armar una respuesta gigante, y el cliente puede procesar los resultados a medida que llegan. Con unary habría que definir un mensaje contenedor con `repeated` y esperar a tener toda la lista.

## gRPC (semana 3) vs REST (semana 2)
- **Más rápido de escribir:** una vez definido el `.proto`, no hubo que escribir rutas, DTOs ni cliente HTTP; el contrato ya define métodos, tipos y streaming.
- **Más difícil de depurar:** los mensajes son binarios y no se pueden probar con curl o Postman; los errores llegan como códigos gRPC (5 = NOT_FOUND) y hay que usar un cliente propio como `cliente.js`. Además, Nest 12 es solo ESM y hubo que adaptar imports y `__dirname`.
- **Streaming:** con REST habría necesitado polling o WebSockets; aquí es solo devolver un `Observable`.

## Diferencia entre @grpc/proto-loader y Grpc.Tools (C#)
`@grpc/proto-loader` carga el `.proto` en tiempo de ejecución (carga dinámica), así que no hay código generado y los tipos se declaran a mano con interfaces. `Grpc.Tools` de C# compila el `.proto` con `protoc` en tiempo de build y genera clases base, DTOs y clientes tipados (generación estática), por lo que el compilador avisa si el contrato cambia.

### Declaración de uso de IA
- Herramienta(s): Claude Code (Claude Sonnet 5)
- Nivel de uso: 3 (la IA escribió el borrador de la práctica y la ejecutó)
- Qué se le pidió: realizar la práctica de la guía web-practica.html (microservicio gRPC de Productos con unary, server streaming, manejo de errores y el reto).
- Qué se modificó/verificó manualmente: la IA ejecutó servidor y cliente y comprobó las salidas; adaptó el código a ESM por Nest 12. Pendiente que el estudiante revise, ejecute y comprenda cada paso.
