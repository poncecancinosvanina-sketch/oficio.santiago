# Oficios Santiago - MVP Marketplace

Este es el MVP (Producto Mínimo Viable) de la plataforma de intermediación de oficios para **Santiago del Estero, Argentina**. La plataforma conecta a clientes finales con proveedores de servicios locales (carpinteros, plomeros, electricistas, albañiles, etc.).

## 🚀 Arquitectura y Stack Tecnológico

- **Frontend:** Next.js (App Router), Tailwind CSS (Diseño mobile-first y responsivo).
- **Backend/Base de Datos:** PostgreSQL en Supabase con extensión **PostGIS** habilitada para consultas geográficas por radio.
- **ORM Opcional:** Prisma (esquema provisto en `frontend/prisma/schema.prisma`).
- **Pagos:** Mercado Pago SDK (recargas de saldo y Webhooks de acreditación).
- **Integraciones:** Notificaciones (WhatsApp API / Email / Web Push).

---

## 🛠️ Estructura de Directorios

El proyecto está diseñado con la siguiente estructura:

```text
oficios-santiago/
├── supabase/                     # Migraciones y Base de Datos (Supabase)
│   └── migrations/
│       └── 20260807000000_init.sql # Script SQL inicial (PostGIS, tablas, triggers)
└── frontend/                     # Aplicación Next.js
    ├── prisma/
    │   └── schema.prisma         # Esquema alternativo en Prisma ORM
    └── src/
        ├── app/                  # Next.js App Router (Rutas de Auth y Dashboard)
        ├── components/           # Componentes UI, mapas y vistas de prestadores
        ├── hooks/                # Hooks personalizados de geolocalización y datos
        ├── lib/                  # Clientes API (Supabase, Mercado Pago)
        └── types/                # Tipos de TypeScript compartidos
```

---

## 💾 Detalle del Modelo de Datos e Intermediación

### 1. Base de Datos (Geolocalización con PostGIS)
El esquema utiliza el tipo de datos `geography(Point, 4326)` en Postgres/PostGIS. Esto permite realizar cálculos de distancia esférica real de forma óptima sin sobrecargar el servidor de aplicaciones.

*Ejemplo de consulta SQL para buscar prestadores activos en el radio de cobertura de una solicitud:*
```sql
select p.*
from public.providers p
where p.is_active = true 
  and p.is_verified = true
  and st_dwithin(
    p.base_location, 
    st_geographyfromtext('SRID=4326;POINT(-64.2588 -27.7834)'), -- Ubicación del cliente (Plaza Libertad)
    p.coverage_radius_km * 1000 -- Convertido a metros
  );
```

### 2. Lógica del Lead y Billetera Prepaga (Trigger Automatizado)
Para garantizar la integridad y la velocidad operativa del MVP, el descuento de créditos se realiza directamente en la base de datos a través del trigger `trg_process_lead_acceptance`:
1. El cliente crea una solicitud de servicio (`service_requests`) con estado `pending`.
2. El prestador recibe la notificación y acepta el lead.
3. Al cambiar el estado a `accepted` y asignar el `provider_id`:
   - El trigger verifica si el saldo del prestador es mayor o igual al costo del lead (`lead_fee_charged`, por defecto `$10.000`).
   - Si no tiene saldo suficiente, **aborta la transacción** y devuelve una excepción SQL.
   - Si tiene saldo, lo descuenta de `wallet_balance` en `public.providers`.
   - Crea un registro de transacción de tipo `lead_deduction` en la tabla `transactions` para el historial financiero.

---

## ⚙️ Instrucciones de Inicialización

### Configuración de Supabase / Postgres
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al editor SQL en tu panel de Supabase y ejecuta el script localizado en `supabase/migrations/20260807000000_init.sql`. Esto activará PostGIS, creará las tablas, enumeraciones y el trigger automático.
3. Copia las credenciales de tu proyecto Supabase (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`).

### Configuración del Frontend (Next.js)
1. Instala las dependencias en la carpeta `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Si usas Prisma, configura la variable de entorno `DATABASE_URL` en tu archivo `.env` y genera el cliente:
   ```bash
   npx prisma generate
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

---

## 💳 Integración de Mercado Pago (Recarga de Saldo)
El flujo sugerido para la monetización del MVP es:
1. El prestador define un monto a recargar en su Dashboard (ej: $20.000).
2. Se consume un endpoint API en Next.js que inicializa una preferencia de pago usando el SDK de Mercado Pago:
   ```javascript
   import { MercadoPagoConfig, Preference } from 'mercadopago';
   
   const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
   const preference = new Preference(client);
   
   const response = await preference.create({
     body: {
       items: [{ title: 'Recarga Saldo Oficios Santiago', quantity: 1, unit_price: 20000 }],
       back_urls: { success: 'https://tuapp.com/dashboard/wallet' },
       notification_url: 'https://tuapp.com/api/webhooks/mercadopago',
       metadata: { provider_id: 'ID_DEL_PRESTADOR' }
     }
   });
   ```
3. El webhook de Mercado Pago recibe la notificación `payment.created` o `payment.updated`, verifica el pago, y si el estado es `approved`, actualiza la billetera e inserta la transacción con el tipo `credit_recharge`.
