.PHONY: install build lint test docker-build docker-run

install:
    npm ci

lint:
    npm run lint

typecheck:
    npm run type-check

build:
    npm run build

test:
    npm test

docker-build:
    docker build -t short-flix:latest .

docker-run:
    docker run --rm -p 3000:3000 short-flix:latest
