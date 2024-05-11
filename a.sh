#!/bin/sh

echo $(cd $(dirname $0) && pwd)/$(basename $0)
if [ "${#}" -eq 0 -o "${1}" = "loto6" ]; then
  node loto6.js
fi
if [ "${#}" -eq 0 -o "${1}" = "loto7" ]; then
  node loto7.js
fi
tail -n 1 loto?.csv
mv loto?.csv ../sandbox-mysql/initdb.d
