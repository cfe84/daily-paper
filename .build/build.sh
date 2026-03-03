#!/bin/bash

docker rm daily-paper
docker build . -t daily-paper
docker create --name daily-paper daily-paper

