# Inventario App — Gestión de Productos y Transacciones

Aplicación web para la gestión de inventarios, desarrollada con arquitectura de
microservicios. Permite administrar productos y registrar/monitorear
transacciones de compra y venta, con actualización automática de stock.

## Arquitectura

```
inventario-app/
├── database/
│   └── schema.sql              # Script de creación de BD, tablas y datos semilla
├── backend/
│   ├── ProductService/         # Microservicio de Gestión de Productos (puerto 5001)
│   ├── TransactionService/     # Microservicio de Gestión de Transacciones (puerto 5002)
│   └── InventarioBackend.sln
├── frontend/                   # Aplicación Angular (puerto 4200)
├── docs/screenshots/           # Evidencias de funcionamiento
├── docker-compose.yml          # SQL Server en contenedor (opcional)
└── README.md
```

- **ProductService** expone el CRUD de productos y un endpoint interno
  (`PATCH /api/productos/{id}/stock`) usado para ajustar el stock.
- **TransactionService** expone el CRUD de transacciones. Antes de registrar
  una venta valida el stock disponible consultando a **ProductService** vía
  **HTTP/REST (síncrono)**, y luego le solicita el ajuste de stock. Ambos
  microservicios son independientes y tienen su propio `DbContext`.
- **Frontend Angular** consume ambas APIs mediante servicios HTTP
  independientes, configurados en `src/environments/environment.ts`.

## Requisitos

Para ejecutar el proyecto en un entorno local se necesita:

- [.NET SDK 8.0](https://dotnet.microsoft.com/download) o superior
- [Node.js 18+](https://nodejs.org/) y npm
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- Un motor **SQL Server**, alguna de estas opciones:
  - SQL Server LocalDB (incluido con Visual Studio / SQL Server Express)
  - SQL Server en Docker (ver `docker-compose.yml` en la raíz del proyecto)
- Un cliente SQL para ejecutar el script (SSMS, Azure Data Studio, DBeaver, etc.)

## Base de datos

1. Levantar SQL Server (si no se tiene instalado localmente, usar Docker):
   ```bash
   docker compose up -d
   ```
2. Ejecutar el script `database/schema.sql` contra el servidor SQL Server.
   Este script crea la base `InventarioDB`, las tablas `Productos` y
   `Transacciones`, sus relaciones/índices, y carga datos de ejemplo.
3. Verificar que la cadena de conexión en `appsettings.json` de cada
   microservicio (`backend/ProductService` y `backend/TransactionService`)
   apunte correctamente al servidor utilizado. Por defecto usan LocalDB:
   ```
   Server=(localdb)\mssqllocaldb;Database=InventarioDB;Trusted_Connection=True;...
   ```
   Si se usa el contenedor Docker, reemplazar por:
   ```
   Server=localhost,1433;Database=InventarioDB;User Id=sa;Password=Inventario123!;TrustServerCertificate=True
   ```

## Ejecución del backend

Cada microservicio se ejecuta de forma independiente. Se recomienda abrir
dos terminales.

**1. ProductService (puerto 5001)**
```bash
cd backend/ProductService
dotnet restore
dotnet run
```
Swagger disponible en: `http://localhost:5001/swagger`

**2. TransactionService (puerto 5002)**
```bash
cd backend/TransactionService
dotnet restore
dotnet run
```
Swagger disponible en: `http://localhost:5002/swagger`

> TransactionService depende de ProductService para validar productos y
> ajustar stock — debe estar corriendo también para que las transacciones
> funcionen correctamente. La URL de ProductService está configurada en
> `backend/TransactionService/appsettings.json` bajo `Services:ProductServiceUrl`.

Alternativamente, ambos servicios pueden abrirse juntos con la solución:
```bash
cd backend
dotnet restore InventarioBackend.sln
```

## Ejecución del frontend

```bash
cd frontend
npm install
npm start
```

La aplicación quedará disponible en `http://localhost:4200`.

Las URLs de los microservicios consumidos por el frontend se configuran en
`frontend/src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  productServiceUrl: 'http://localhost:5001',
  transactionServiceUrl: 'http://localhost:5002'
};
```

## Funcionalidades principales

- **Productos**: alta, edición, eliminación (lógica) y listado paginado con
  filtros dinámicos (nombre, categoría, rango de precio, stock mínimo).
- **Transacciones**: registro de compras/ventas con validación de stock
  disponible antes de vender, historial paginado con filtros dinámicos por
  producto, tipo y rango de fechas, mostrando nombre y stock actual del
  producto asociado.
- Mensajes de éxito/error en todas las operaciones (toast notifications).
- Validaciones de formulario (campos obligatorios, formatos, rangos) y
  validación compleja de stock antes de confirmar una venta.
- Pantalla de consulta de información de una transacción (modo edición
  muestra el detalle completo de solo lectura, con opción de actualizar
  observaciones).

## Evidencias

| Evidencia | Archivo en carpeta docs |
|---|---|
| Listado dinámico de productos con paginación | `docs/screenshots/01-listado-productos.png` |
| Listado dinámico de transacciones con paginación | `docs/screenshots/02-listado-transacciones.png` |
| Creación de producto | `docs/screenshots/03-crear-producto.png` |
| Edición de producto | `docs/screenshots/04-editar-producto.png` |
| Creación de transacción | `docs/screenshots/05-crear-transaccion.png` |
| Edición de transacción | `docs/screenshots/06-editar-transaccion.png` |
| Filtros dinámicos (productos y/o transacciones) | `docs/screenshots/07-filtros-dinamicos.png` |
| Consulta de información de un formulario (extra) | `docs/screenshots/08-consulta-transaccion.png` |
