# Barbershop Frontend

Frontend web para el sistema de gestión de barbería, construido con React + TypeScript + Vite.

## Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Componente principal
│   │   ├── HaircutForm.tsx     # Formulario para crear/editar
│   │   ├── HaircutList.tsx     # Tabla de haircuts
│   │   ├── Statistics.tsx      # Panel de estadísticas con gráficos
│   │   └── ...
│   ├── hooks/
│   │   └── useHaircuts.ts      # Hook personalizado para API
│   ├── services/
│   │   └── haircutService.ts   # Servicio de API
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── tests/
│   │   └── setup.ts            # Configuración de tests
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo corre en `http://localhost:3000` y proxyifica las peticiones `/haircuts` al backend en `http://localhost:8000`.

## Construcción

```bash
npm run build
```

## Testing

```bash
npm run test
```

Los tests unitarios utilizan Vitest + React Testing Library.

## Librerías Principales

### Recharts - Visualización de Datos

El proyecto utiliza [Recharts](https://recharts.org/) para los gráficos de estadísticas:

- **Gráfico de área**: Ingresos de los últimos 7 días
- **Gráfico de barras**: Cantidad de cortes por día
- **Gráfico circular**: Distribución por tipo de servicio
- **Gráfico de línea**: Tendencia mensual (cortes vs ingresos)

Instalación:
```bash
npm install recharts
```

### Testing

El proyecto utiliza:
- **Vitest**: Framework de testing
- **React Testing Library**: Utilidades para testing de componentes React
- **jsdom**: Implementación de DOM para Node.js

Instalación:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/jsdom
```

## Características

- Listado de cortes de cabello
- Crear nuevos cortes
- Editar cortes existentes
- Eliminar cortes
- Panel de estadísticas con gráficos
- Interfaz responsive
- Manejo de errores
- Tests unitarios

## Pestaña de Estadísticas

La pestaña "Estadísticas" incluye:

- **Tarjetas de resumen**: Total ingresos, total cortes, promedio diario, servicio más popular
- **Gráfico de área**: Ingresos de los últimos 7 días con tendencia
- **Gráfico de barras**: Cantidad de cortes por día de la semana
- **Gráfico circular**: Distribución porcentual por tipo de servicio
- **Gráfico de línea dual**: Tendencia mensual mostrando cortes e ingresos
- **Tabla detallada**: Desglose por servicio con participación de mercado
