/* =========================================================
   Script de creación de Base de Datos - Inventario App
   Motor: SQL Server
   ========================================================= */

IF DB_ID('InventarioDB') IS NULL
BEGIN
    CREATE DATABASE InventarioDB;
END
GO

USE InventarioDB;
GO

/* =========================================================
   Tabla: Productos
   ========================================================= */
IF OBJECT_ID('dbo.Productos', 'U') IS NOT NULL
    DROP TABLE dbo.Productos;
GO

CREATE TABLE dbo.Productos (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nombre        NVARCHAR(150)   NOT NULL,
    Descripcion   NVARCHAR(500)   NULL,
    Categoria     NVARCHAR(100)   NOT NULL,
    ImagenUrl     NVARCHAR(500)   NULL,
    Precio        DECIMAL(18,2)   NOT NULL DEFAULT 0,
    Stock         INT             NOT NULL DEFAULT 0,
    FechaCreacion DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    Activo        BIT             NOT NULL DEFAULT 1
);
GO

CREATE INDEX IX_Productos_Nombre ON dbo.Productos(Nombre);
CREATE INDEX IX_Productos_Categoria ON dbo.Productos(Categoria);
GO

/* =========================================================
   Tabla: Transacciones
   ========================================================= */
IF OBJECT_ID('dbo.Transacciones', 'U') IS NOT NULL
    DROP TABLE dbo.Transacciones;
GO

CREATE TABLE dbo.Transacciones (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Fecha           DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    TipoTransaccion NVARCHAR(20)    NOT NULL, -- 'Compra' o 'Venta'
    ProductoId      INT             NOT NULL,
    Cantidad        INT             NOT NULL,
    PrecioUnitario  DECIMAL(18,2)   NOT NULL,
    PrecioTotal     DECIMAL(18,2)   NOT NULL,
    Detalle         NVARCHAR(500)   NULL,
    CONSTRAINT CK_Transacciones_Tipo CHECK (TipoTransaccion IN ('Compra','Venta')),
    CONSTRAINT FK_Transacciones_Productos FOREIGN KEY (ProductoId)
        REFERENCES dbo.Productos(Id)
);
GO

CREATE INDEX IX_Transacciones_ProductoId ON dbo.Transacciones(ProductoId);
CREATE INDEX IX_Transacciones_Fecha ON dbo.Transacciones(Fecha);
CREATE INDEX IX_Transacciones_Tipo ON dbo.Transacciones(TipoTransaccion);
GO

/* =========================================================
   Datos de ejemplo (seed)
   ========================================================= */
INSERT INTO dbo.Productos (Nombre, Descripcion, Categoria, ImagenUrl, Precio, Stock)
VALUES
    (N'Laptop Dell Inspiron 15', N'Laptop 15" Core i5 8GB RAM 512GB SSD', N'Tecnología', N'https://via.placeholder.com/150', 750.00, 25),
    (N'Mouse Logitech M170', N'Mouse inalámbrico', N'Tecnología', N'https://via.placeholder.com/150', 15.50, 100),
    (N'Silla Ergonómica', N'Silla de oficina ajustable', N'Mobiliario', N'https://via.placeholder.com/150', 120.00, 40),
    (N'Escritorio de Madera', N'Escritorio 120x60cm', N'Mobiliario', N'https://via.placeholder.com/150', 200.00, 15),
    (N'Monitor LG 24"', N'Monitor Full HD IPS', N'Tecnología', N'https://via.placeholder.com/150', 180.00, 30);
GO

INSERT INTO dbo.Transacciones (Fecha, TipoTransaccion, ProductoId, Cantidad, PrecioUnitario, PrecioTotal, Detalle)
VALUES
    (SYSUTCDATETIME(), N'Compra', 1, 10, 700.00, 7000.00, N'Compra inicial a proveedor'),
    (SYSUTCDATETIME(), N'Venta', 1, 2, 750.00, 1500.00, N'Venta a cliente corporativo'),
    (SYSUTCDATETIME(), N'Compra', 2, 50, 12.00, 600.00, N'Reposición de stock'),
    (SYSUTCDATETIME(), N'Venta', 3, 5, 120.00, 600.00, N'Venta minorista');
GO
