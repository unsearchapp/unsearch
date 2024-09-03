docker compose -f docker-compose.test.yml up --build -d postgres backend frontend

docker compose -f docker-compose.test.yml run --rm playwright

docker compose -f docker-compose.test.yml down