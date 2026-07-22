# MantaTrack Logistics — Plataforma de monitoreo de flotas

Plataforma web completa (full-stack) para que dueños de flotas de transporte en Manta,
Ecuador vean en tiempo real dónde está cada camión, reciban alertas automáticas,
consulten el historial de recorridos, generen reportes en PDF y compartan un enlace
de seguimiento con sus clientes — reemplazando la coordinación por llamadas y WhatsApp.

Construida a partir del pitch deck y los mockups de MantaTrack Logistics.

## Arquitectura

```
mantatrack/
├── server/     Backend: Node.js + Express + SQLite + Socket.IO + JWT
└── client/     Frontend: React + Vite + Tailwind + Leaflet + Recharts
```

- **Autenticación real**: registro de empresa, login con JWT, contraseñas cifradas (bcrypt).
- **Base de datos SQLite** (persistente en disco, sin servicios externos que configurar):
  empresas, usuarios, camiones, conductores, alertas, historial de recorridos,
  mantenimiento y reportes.
- **Simulación de GPS en tiempo real**: cada 4 segundos el backend mueve los camiones
  sobre rutas reales entre Manta, Portoviejo, Montecristi y Jaramijó, genera alertas
  automáticas (desvíos, detenciones, combustible bajo) y transmite las posiciones
  por WebSocket (Socket.IO) a todos los paneles conectados.
- **Reportes en PDF** generados en el servidor (pdfkit), descargables desde el panel.
- **Enlace público de seguimiento** (`/#/seguimiento/:token`) que el transportista
  comparte con su cliente final, sin necesidad de cuenta.

## Funcionalidades incluidas

| Módulo | Qué hace |
|---|---|
| Inicio (Panel de control) | Resumen de flota, mapa en vivo, alertas activas, reportes rápidos, resumen del día |
| Mapa en tiempo real | Mapa a pantalla completa con buscador y ficha por camión |
| Rutas | Seguimiento en vivo por camión con trayectoria (trail) |
| Alertas | Activas / resueltas, con detalle y acción de resolver |
| Historial | Filtros por camión y fecha, gráfico de distancia, exportar CSV |
| Reportes | Resumen de flota, rendimiento, combustible, entregas — PDF descargable |
| Conductores | Alta/baja de conductores y camión asignado |
| Mantenimiento | Programación y seguimiento de mantenimientos por unidad |
| Configuración | Datos de la empresa, cuenta del usuario y plan contratado |
| Detalle de camión | Panel con pestañas Información / Recorrido / Estadísticas, compartir ubicación y contactar al conductor |
| Seguimiento público | Página sin login para el cliente final del transportista |

## Cómo ejecutar el proyecto

Necesitas [Node.js](https://nodejs.org) 18 o superior instalado.

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Esto crea automáticamente la base de datos SQLite en `server/data/mantatrack.sqlite`
con datos de ejemplo la primera vez que se ejecuta. Queda escuchando en
`http://localhost:4000`.

**Cuenta demo precargada:** `admin@mantatrack.ec` / `mantatrack2026`

### 2. Frontend

En otra terminal:

```bash
cd client
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador. El frontend ya está configurado
(`client/.env`) para conectarse al backend en `http://localhost:4000`.

### 3. Producción (build)

```bash
cd client
npm run build      # genera client/dist
npm run preview    # sirve el build de producción
```

El backend (`server/`) se ejecuta igual en producción con `npm start`; solo asegúrate
de definir `JWT_SECRET` propio en un archivo `.env` dentro de `server/`.

## Notas para desplegarlo en internet

Este proyecto corre completo en tu computadora. Para que tus clientes lo usen desde
cualquier lugar, necesitas desplegarlo en un servicio de hosting (por ejemplo Railway,
Render o un VPS para el backend, y Vercel/Netlify para el frontend), y actualizar
`VITE_API_URL` en `client/.env` con la URL pública de tu backend.

## Siguientes pasos sugeridos

- Reemplazar la simulación de GPS por la integración con dispositivos GPS reales
  (por ejemplo, vía Traccar u otro proveedor de rastreo vehicular).
- Enviar las alertas también por WhatsApp/SMS además de mostrarlas en el panel.
- Roles de usuario (supervisor vs. administrador) con permisos distintos.
