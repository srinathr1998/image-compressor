#!/usr/bin/env node

import sharp from "sharp";
import { writeFile, stat } from "node:fs/promises";
import path from "node:path";

async function parseArguments() {
  const args = process.argv.slice(2);
  if (args.length != 2 && args.length != 3) {
    console.log(
      "Please provide either 2 or 3 arguments in the order : input image path, output image path, quality percentage or zliblevel depending on .jpeg or .png!"
    );
    process.exit(1);
  }
  const inputImagePath = path.resolve(args[0]);
  const outputImagePath = path.resolve(args[1]);
  if (!(await isValidPngOrJpegImage(inputImagePath))) {
    console.log(
      "Please provide path to a valid .png,.jpg or a .jpeg input image file"
    );
    process.exit(1);
  }
  const level = parseInt(args[2]);
  return { inputImagePath, outputImagePath, level };
}

function getExtName(filePath: string) {
  return path.extname(filePath).toLowerCase();
}

async function isValidPngOrJpegImage(inputImagePath: string) {
  const fileStats = await stat(inputImagePath);
  if (!fileStats.isFile()) {
    return false;
  }
  const extName = getExtName(inputImagePath);
  if (extName != ".png" && extName != ".jpeg" && extName != ".jpg") {
    return false;
  }
  return true;
}

async function compressPng(
  filePath: string,
  outputFilePath: string,
  zlibLevel: number = 2
) {
  try {
    const inputImageBuffer = await sharp(filePath).png().toBuffer();
    const compressedImageBuffer = await sharp(inputImageBuffer)
      .png({
        compressionLevel: zlibLevel,
      })
      .toBuffer();
    await sharp(compressedImageBuffer).toFile(outputFilePath);
  } catch (err) {
    console.error("Error : " + err);
  }
}

async function compressJpeg(
  filePath: string,
  outputFilePath: string,
  quality: number = 80
) {
  try {
    const compressedImageBuffer = await sharp(filePath)
      .jpeg({
        quality: quality,
        chromaSubsampling: "4:4:4",
      })
      .toBuffer();
    await writeFile(outputFilePath, compressedImageBuffer);
  } catch (err) {
    console.error("Error : " + err);
  }
}

async function run() {
  const { inputImagePath, outputImagePath, level } = await parseArguments();
  if (
    getExtName(inputImagePath) == ".jpg" ||
    getExtName(inputImagePath) == ".jpeg"
  ) {
    await compressJpeg(inputImagePath, outputImagePath, level);
  } else {
    await compressPng(inputImagePath, outputImagePath, level);
  }
  console.log("Compression complete!");
  process.exit(0);
}

run();