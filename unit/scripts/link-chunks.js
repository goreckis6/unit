#!/usr/bin/env node
/**
 * Create symlinks for webpack server chunks.
 * Fix: webpack-runtime does require("./5611.js") but chunks live in ./chunks/
 * Run this after build, or alongside dev to fix chunk resolution.
 */
import fs from 'fs';
import path from 'path';

const serverDir = path.join(process.cwd(), '.next', 'server');
const chunksDir = path.join(serverDir, 'chunks');
if (!fs.existsSync(chunksDir)) process.exit(0);

let count = 0;
for (const name of fs.readdirSync(chunksDir)) {
  if (!name.endsWith('.js')) continue;
  const target = path.join(chunksDir, name);
  const linkPath = path.join(serverDir, name);
  try {
    if (fs.existsSync(linkPath)) fs.unlinkSync(linkPath);
    const rel = path.relative(path.dirname(linkPath), target);
    fs.symlinkSync(rel, linkPath, 'file');
    count++;
  } catch (e) {
    // ignore
  }
}
if (count > 0) {
  console.log(`[link-chunks] Created ${count} chunk symlinks`);
}
