#!/bin/bash
for file in $(find . -type f -name "*.jsx"); do 
  base=$(basename "$file")
  newbase="$(echo "${base:0:1}" | tr '[:lower:]' '[:upper:]')${base:1}"
  if [ "$base" != "$newbase" ]; then 
    dir=$(dirname "$file")
    tmp="$dir/temp_$newbase"
    git mv "$file" "$tmp"
    git mv "$tmp" "$dir/$newbase"
  fi
done
