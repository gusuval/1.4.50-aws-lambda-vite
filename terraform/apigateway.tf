resource "aws_apigatewayv2_api" "todo_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.todo_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.todo_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.todo_api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "list_tasks" {
  api_id    = aws_apigatewayv2_api.todo_api.id
  route_key = "GET /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "create_task" {
  api_id    = aws_apigatewayv2_api.todo_api.id
  route_key = "POST /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get_task" {
  api_id    = aws_apigatewayv2_api.todo_api.id
  route_key = "GET /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "update_task" {
  api_id    = aws_apigatewayv2_api.todo_api.id
  route_key = "PUT /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "delete_task" {
  api_id    = aws_apigatewayv2_api.todo_api.id
  route_key = "DELETE /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "apigateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.todo_api.execution_arn}/*/*"
}
