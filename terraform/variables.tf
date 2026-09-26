variable "aws_region" {
  description = "Región de AWS donde se despliega todo"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Prefijo usado en los nombres de los recursos"
  type        = string
  default     = "todo-list-serverless"
}

variable "table_name" {
  description = "Nombre de la tabla DynamoDB de tareas"
  type        = string
  default     = "todo-tasks"
}
