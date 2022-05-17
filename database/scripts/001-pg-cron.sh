#!/bin/sh

set -e

printf "\nPGDATA: $PGDATA/postgresql.conf\n"
printf "\nshared_preload_libraries = 'pg_cron'" >> $PGDATA/postgresql.conf
printf "\ncron.database_name = '$POSTGRES_DB'" >> $PGDATA/postgresql.conf

pg_ctl restart