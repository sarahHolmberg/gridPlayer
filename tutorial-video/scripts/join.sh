#!/usr/bin/env bash
# Joins out/scene1.mp4 … out/scene5.mp4 into out/full.mp4 (scenes without sound get a silent track).
set -euo pipefail
cd "$(dirname "$0")/.."
inputs=(); filters=""; n=0
for i in 1 2 3 4 5; do
  f="out/scene$i.mp4"
  inputs+=(-i "$f")
  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | grep -q .; then
    filters+="[$n:v:0]setsar=1[v$n];[$n:a:0]aresample=48000,aformat=channel_layouts=stereo[a$n];"
  else
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
    filters+="[$n:v:0]setsar=1[v$n];anullsrc=r=48000:cl=stereo,atrim=0:$d[a$n];"
  fi
  n=$((n+1))
done
for i in $(seq 0 $((n-1))); do filters+="[v$i][a$i]"; done
filters+="concat=n=$n:v=1:a=1[v][a]"
ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k out/full.mp4
echo "wrote out/full.mp4"
