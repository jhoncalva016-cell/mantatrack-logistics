const PLANS = [
  {
    key: 'basico',
    name: 'Plan Básico',
    priceUsd: 19,
    maxVehicles: 5,
    features: [
      'Hasta 5 camiones',
      'Mapa en tiempo real',
      'Alertas automáticas',
      'Historial de 30 días',
      'Enlace de seguimiento para clientes',
    ],
  },
  {
    key: 'profesional',
    name: 'Plan Profesional',
    priceUsd: 49,
    maxVehicles: 20,
    features: [
      'Hasta 20 camiones',
      'Todo lo del Plan Básico',
      'Reportes en PDF ilimitados',
      'Gestión de conductores',
      'Programación de mantenimiento',
      'Historial ilimitado',
    ],
  },
  {
    key: 'empresarial',
    name: 'Plan Empresarial',
    priceUsd: 129,
    maxVehicles: 100,
    features: [
      'Hasta 100 camiones',
      'Todo lo del Plan Profesional',
      'Soporte prioritario',
      'Múltiples usuarios administradores',
      'Exportación avanzada de datos',
    ],
  },
];

function getPlan(key) {
  return PLANS.find((p) => p.key === key);
}

module.exports = { PLANS, getPlan };
