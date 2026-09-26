# CLAUDE.md — Todo List Serverless (AWS Lambda + DynamoDB + Vite)

Este documento consolida el encargo de `PROMPT.md` con las decisiones de diseño ya
fijadas en `README.md`. Es la referencia de trabajo para implementar el proyecto:
todavía no existe código en el repo (solo `PROMPT.md` y `README.md`), así que las
siguientes secciones son la especificación a seguir al crear `terraform/`, `lambda/`
y `frontend/`.

## 1. Alcance (de `PROMPT.md`)

- [ ] Infraestructura 100% Terraform.
- [ ] Una Lambda con acceso público (a través de API Gateway v2, ver §4 — la
      Function URL pública da 403 por el "Block Public Access" de AWS 2024).
- [ ] Una tabla DynamoDB accesible desde la Lambda.
- [ ] El modelo de datos de DynamoDB es la lista de tareas (todo list).
- [ ] Evitar problemas de permisos: IAM de mínimo privilegio pero **sin dejar la
      Lambda sin permisos que necesite** (el fallo típico es tan malo como el de
      sobre-permisos).
- [ ] Probar el sistema con `terraform apply -auto-approve` y comprobar que la
      Lambda funciona de verdad (no solo `terraform plan`).
- [ ] Web en Vite que consuma la API de la Lambda.
- [ ] Web con diseño profesional/cuidado (no un CRUD sin estilos).
- [ ] La web presenta la lista de tareas y todas las operaciones sobre ella (crear,
      listar, editar, completar, borrar).
- [ ] Subir el proyecto a GitHub.
- [ ] Desplegar el frontend en Vercel.

## 2. Arquitectura acordada (de `README.md`)

```
Vite + React (Vercel) → HTTPS/JSON + CORS → API Gateway v2 (HTTP API) → Lambda Python 3.12 → boto3 → DynamoDB (todo-tasks)
```

Todo lo anterior definido en `terraform/` (p. ej. `lambda.tf`, `dynamodb.tf`,
`apigateway.tf`, `outputs.tf`).

| Pieza | Tecnología |
|---|---|
| Backend | AWS Lambda Python 3.12, handler único en `lambda/handler.py` |
| Base de datos | DynamoDB `todo-tasks`, PK `id` (String), `PAY_PER_REQUEST` |
| Endpoint | API Gateway v2 (HTTP API) con CORS |
| IaC | Terraform (`terraform/`) |
| Frontend | Vite + React + TypeScript + Tailwind, estética editorial (Playfair/Lora) |
| Hosting frontend | Vercel |

## 3. Modelo de datos

`{ id (UUID), title, completed, createdAt, updatedAt }`

## 4. Contrato de la API

| Método | Path | Acción |
|---|---|---|
| GET | `/tasks` | Listar tareas |
| POST | `/tasks` | Crear tarea |
| GET | `/tasks/{id}` | Obtener tarea |
| PUT | `/tasks/{id}` | Actualizar (`title` / `completed`) |
| DELETE | `/tasks/{id}` | Eliminar |

Toda respuesta es JSON con cabeceras CORS, incluso en errores.

## 5. Reglas de implementación

1. **Un solo handler enruta todo**: lee método y path del evento de API Gateway v2
   y despacha internamente a la operación de DynamoDB correspondiente.
2. **API Gateway v2, no Function URL pública** — la Function URL choca con el
   "Block Public Access" de Lambda; usar siempre API Gateway v2 HTTP API.
3. **IAM de mínimo privilegio**: el rol de la Lambda solo debe tener
   `PutItem`, `GetItem`, `UpdateItem`, `DeleteItem`, `Scan` sobre la tabla
   `todo-tasks` concreta (por ARN), nunca `dynamodb:*` ni `Resource: "*"`.
4. **Sin URLs hardcodeadas**: el frontend recibe la URL de la API vía
   `terraform output` → variable de entorno `VITE_API_URL` de Vite. El código
   fuente nunca debe llevar la URL de API Gateway escrita a mano.
5. **CORS**: la configuración de CORS de API Gateway debe permitir el origen de
   desarrollo local de Vite y el dominio final de Vercel; no restringir de forma
   que rompa las pruebas en `terraform apply -auto-approve` seguidas de pruebas
   manuales.

## 6. Plan de pruebas (obligatorio antes de dar por cerrado el backend)

```bash
cd terraform
terraform init
terraform apply -auto-approve
terraform output   # URL pública de la API
```

Después, probar la Lambda de verdad contra esa URL (curl o similar) cubriendo las
5 operaciones de §4, no solo que `terraform apply` termine sin error.

## 7. Frontend

```bash
cd frontend
npm install
# VITE_API_URL = URL del output de Terraform
npm run dev
```

- Presentar la lista de tareas y las operaciones (crear/editar/completar/borrar)
  con una interfaz cuidada, no un formulario sin estilos — línea editorial
  Playfair/Lora + Tailwind ya fijada en `README.md`.
- Antes de dar por terminado el frontend, arrancarlo y probar el camino
  completo en el navegador (crear, listar, completar, editar, borrar).

## 8. Entrega

- Repo subido a GitHub.
- Frontend desplegado en Vercel con `VITE_API_URL` apuntando a la API real.
- `terraform destroy` documentado en el README para limpieza (ya está).

## 9. Fuera de alcance

No penalizar ni añadir nada que no esté pedido explícitamente en `PROMPT.md`
(p. ej. autenticación, roles de usuario, límites de rate, etc.) salvo que se
solicite más adelante.
