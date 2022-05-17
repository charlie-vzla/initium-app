# Initium queue app
Application to handle queue of clients, in one queue each client last for 2 mins and the other queue 3 min

## Prerequisites
 * [docker](https://docs.docker.com/get-docker/)
 * [docker-compose](https://docs.docker.com/compose/install/)

## Run

```bash
    docker-compose up -d
```
`Wait for initium-webapp to be healthy or check localhost:9022 to start using the app`

## Stop
To stop the app without removing the volume: `docker-compose down`, to remove the volume add `--volumes`
