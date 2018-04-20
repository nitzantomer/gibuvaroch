#!/bin/bash

for KEY_NAME in buyer seller; do
    rm -rf temp-keys/$KEY_NAME/*
    mkdir -p temp-keys/$KEY_NAME
    ssh-keygen -t rsa -b 4096 -N "" -f temp-keys/$KEY_NAME/key
    ssh-keygen -f temp-keys/$KEY_NAME/key.pub -e -m pem > temp-keys/$KEY_NAME/key.pub.pem
done

