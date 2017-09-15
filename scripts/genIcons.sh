#!/bin/bash

OUTPUT_PATH="../resources/ios/icon/"
ICON="base_icon.png"

echo "Generating iOS icons ..."
convert ${ICON} -resize 40 ${OUTPUT_PATH}/icon-40.png
convert ${ICON} -resize 80 ${OUTPUT_PATH}/icon-40@2x.png
convert ${ICON} -resize 120 ${OUTPUT_PATH}/icon-40@3x.png
convert ${ICON} -resize 50 ${OUTPUT_PATH}/icon-50.png
convert ${ICON} -resize 100 ${OUTPUT_PATH}/icon-50@2x.png
convert ${ICON} -resize 60 ${OUTPUT_PATH}/icon-60.png
convert ${ICON} -resize 120 ${OUTPUT_PATH}/icon-60@2x.png
convert ${ICON} -resize 180 ${OUTPUT_PATH}/icon-60@3x.png
convert ${ICON} -resize 72 ${OUTPUT_PATH}/icon-72.png
convert ${ICON} -resize 144 ${OUTPUT_PATH}/icon-72@2x.png
convert ${ICON} -resize 76 ${OUTPUT_PATH}/icon-76.png
convert ${ICON} -resize 152 ${OUTPUT_PATH}/icon-76@2x.png
convert ${ICON} -resize 167 ${OUTPUT_PATH}/icon-83.5@2x.png
convert ${ICON} -resize 29 ${OUTPUT_PATH}/icon-small.png
convert ${ICON} -resize 58 ${OUTPUT_PATH}/icon-small@2x.png
convert ${ICON} -resize 87 ${OUTPUT_PATH}/icon-small@3x.png
convert ${ICON} -resize 57 ${OUTPUT_PATH}/icon.png
convert ${ICON} -resize 114 ${OUTPUT_PATH}/icon@2x.png

echo "Finished generating iOS icons!"
