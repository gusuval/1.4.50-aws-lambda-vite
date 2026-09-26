# Costes del proyecto

Este documento cubre dos cosas distintas que a menudo se confunden:

1. **Coste de generación**: lo que cuesta usar un modelo de IA (Claude) para escribir el código y la infraestructura de este proyecto.
2. **Coste de despliegue**: lo que cuesta *tener el proyecto funcionando* en AWS (backend) y Vercel (frontend).

Ambos son estimaciones basadas en tarifas públicas (AWS, Vercel, Anthropic) a fecha de **26 de septiembre de 2026**. Para cifras exactas y actualizadas, consulta las fuentes oficiales enlazadas en cada sección.

---

## 1. Coste de generación (desarrollo asistido por IA)

Este proyecto se generó con **Claude Code**, usando el modelo **Claude Sonnet 5** (`claude-sonnet-5`).

### Tarifas del modelo

| Concepto | Precio |
|---|---|
| Tokens de entrada | $2.00 por millón de tokens |
| Tokens de salida | $10.00 por millón de tokens |
| Lectura de caché de prompt (aprox.) | ~$0.20 por millón de tokens |
| Escritura de caché de prompt (aprox.) | ~$2.50 por millón de tokens |

Fuente: [anthropic.com/pricing](https://www.anthropic.com/pricing) — Claude Sonnet 5.

### Estimación para esta sesión

Claude Code no expone el recuento exacto de tokens dentro de la propia conversación. La cifra fiable es la que muestra el propio CLI:

```bash
/cost
```

Como referencia, esta sesión implicó:

- ~25 ficheros de código generados (Terraform, Lambda, frontend Vite/React).
- Varias decenas de llamadas a herramientas (terraform apply, npm install, capturas de navegador para verificación visual).
- Varias capturas de pantalla del navegador (cada una consume tokens de imagen, del orden de 1.000-1.500 tokens equivalentes cada una).

Con ese volumen de trabajo, el orden de magnitud típico para una sesión de este tamaño con Sonnet 5 es:

| Partida | Tokens (estimado) | Coste (estimado) |
|---|---|---|
| Entrada (contexto, ficheros, salidas de comandos, capturas) | 300.000 – 600.000 | $0.60 – $1.20 |
| Salida (código y texto generado) | 40.000 – 70.000 | $0.40 – $0.70 |
| **Total estimado de esta sesión** | | **≈ $1 – $2** |

> Esto es una **aproximación ilustrativa**, no una factura. El dato exacto está en `/cost` (Claude Code) o en el panel *Usage & Cost* de la consola de Anthropic.

---

## 2. Coste de despliegue

### 2.1 Backend (AWS) — `terraform/`

Recursos desplegados: 1 función Lambda, 1 tabla DynamoDB (`PAY_PER_REQUEST`), API Gateway v2 (HTTP API), CloudWatch Logs.

| Servicio | Tarifa | Capa gratuita |
|---|---|---|
| **Lambda** (peticiones) | $0.20 por millón de invocaciones | 1.000.000 invocaciones/mes gratis, **para siempre** |
| **Lambda** (cómputo) | $0.0000166667 por GB-segundo | 400.000 GB-segundos/mes gratis, **para siempre** |
| **DynamoDB on-demand** (escritura) | $0.625 por millón de WRU | — |
| **DynamoDB on-demand** (lectura) | $0.125 por millón de RRU | — |
| **DynamoDB** (almacenamiento) | $0.25 por GB-mes | 25 GB gratis |
| **API Gateway HTTP API** | $1.00 por millón de peticiones (primeros 300M) | 1.000.000 peticiones/mes gratis durante los primeros 12 meses de la cuenta |
| **CloudWatch Logs** | ~$0.50/GB ingerido + ~$0.03/GB-mes almacenado | 5 GB de ingesta/mes gratis |

Fuentes: [Lambda](https://aws.amazon.com/lambda/pricing/) · [DynamoDB on-demand](https://aws.amazon.com/dynamodb/pricing/on-demand/) · [API Gateway](https://aws.amazon.com/api-gateway/pricing/).

#### Escenarios de uso mensual

| Escenario | Peticiones/mes | Coste estimado/mes |
|---|---|---|
| **Demo / pruebas de este proyecto** (decenas de peticiones) | < 100 | **$0.00** (todo dentro de capa gratuita) |
| **Uso ligero real** | 10.000 | **$0.00 – $0.02** (sigue dentro de capa gratuita de Lambda; API Gateway aún en el año gratuito) |
| **Uso moderado, cuenta ya sin capa gratuita de API Gateway** | 100.000 | ≈ $0.10 (API Gateway) + céntimos de Lambda/DynamoDB ≈ **$0.15 – $0.25** |
| **1.000.000 peticiones/mes, sin capa gratuita** | 1.000.000 | ≈ $1.00 (API Gateway) + ≈ $0.20 (Lambda, si excede la capa gratuita) + DynamoDB según lecturas/escrituras ≈ **$1.50 – $3.00** |

En la práctica, para un proyecto de este tamaño (lista de tareas personal/demo), **el coste real esperado es $0.00/mes**: el tráfico no se acerca a los límites de la capa gratuita de Lambda ni de DynamoDB.

### 2.2 Frontend (Vercel)

Desplegado en el plan **Hobby (gratuito)**:

| Plan | Precio | Incluye |
|---|---|---|
| **Hobby** (usado en este proyecto) | **$0/mes** | 1M edge requests/mes, 100 GB de transferencia/mes, CDN global, HTTPS, despliegues ilimitados |
| Pro (referencia, no usado) | $20/mes por miembro | 10M edge requests/mes, 1 TB transferencia/mes, más reglas de firewall |

Fuente: [vercel.com/pricing](https://vercel.com/pricing).

Una SPA estática como esta (build de ~230 KB) consume una fracción mínima de esos límites; el plan gratuito es más que suficiente.

### 2.3 Resumen total de despliegue

| Componente | Coste mensual estimado |
|---|---|
| AWS (Lambda + DynamoDB + API Gateway + CloudWatch) | **$0.00** (uso de demo, dentro de capa gratuita) |
| Vercel (frontend, plan Hobby) | **$0.00** |
| **Total** | **$0.00/mes** para el volumen de tráfico de este proyecto |

El único coste real es el de generación con IA (sección 1), del orden de **1-2 dólares** para toda la sesión de desarrollo. El despliegue en sí, a la escala de una demo/proyecto académico, es gratuito.
