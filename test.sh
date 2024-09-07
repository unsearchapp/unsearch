docker compose -f docker-compose.test.yml up --build -d postgres backend frontend migrate

docker compose -f docker-compose.test.yml build --no-cache playwright

docker compose -f docker-compose.test.yml run --rm playwright

docker compose -f docker-compose.test.yml down