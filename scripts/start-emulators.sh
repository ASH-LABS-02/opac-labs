#!/bin/sh
set -eu
mkdir -p /data
if [ -f /data/firebase-export-metadata.json ]; then
  exec firebase emulators:start --config firebase.docker.json --project demo-opac-labs --only auth,firestore --import=/data --export-on-exit=/data
fi
exec firebase emulators:start --config firebase.docker.json --project demo-opac-labs --only auth,firestore --export-on-exit=/data
