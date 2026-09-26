output "api_endpoint" {
  description = "URL pública de la API de tareas (usar como VITE_API_URL en el frontend)"
  value       = aws_apigatewayv2_api.todo_api.api_endpoint
}

output "dynamodb_table_name" {
  description = "Nombre de la tabla DynamoDB de tareas"
  value       = aws_dynamodb_table.todo_tasks.name
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.todo_api.function_name
}
