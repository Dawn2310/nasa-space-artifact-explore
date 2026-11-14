#!/usr/bin/env bash
# Re-download every bundled asset from the official NASA repository at the pinned commit and verify checksums.
set -euo pipefail
cd "$(dirname "$0")/../public/assets"
mkdir -p models textures images
fail=0
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Apollo%20Lunar%20Module/Apollo%20Lunar%20Module.glb" -o "models/apollo-lunar-module.glb"
echo "379101dfcee399267addf771709107c35e826b0b9e5233272f123e4c8a585c4e  models/apollo-lunar-module.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Dawn/Dawn.glb" -o "models/dawn.glb"
echo "411249aed791994b6a2014894ad6bd7ca0445dbcf6d5342af9edc5df988f04b7  models/dawn.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/InSight%20Cruise%20Lander/InSight%20Cruise%20Lander%20%28panels%20deployed%29.glb" -o "models/insight-lander-panels-deployed.glb"
echo "4e4c0c8b034de9f265d2e0b52bd7547254b5547eb09edc97e694b3d990849fb8  models/insight-lander-panels-deployed.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Ingenuity%20Mars%20Helicopter/Ingenuity%20Mars%20Helicopter.glb" -o "models/ingenuity.glb"
echo "9e5a5398ab335eae7d46335085301ce46fb7de052300b645debe8bac6d39f2b5  models/ingenuity.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Kepler%20%28A%29/Kepler%20%28A%29.glb" -o "models/kepler-a.glb"
echo "382014d90e2cf3e1f23e931d233547e652fe3629fddfb5acb8a99e2ceb72ff19  models/kepler-a.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29/Mars%20Exploration%20Rover%20-%20Opportunity%20%28MER-B%29.glb" -o "models/mer-opportunity.glb"
echo "95c852efb385b55bea3104a0fca2730cd2ef25353af4d38273d3f0bda5c68c31  models/mer-opportunity.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/NEAR%20Shoemaker/NEAR%20Shoemaker.glb" -o "models/near-shoemaker.glb"
echo "f3de2f87c97685b207be97e80d7cdca37d1567dd68204e1feb2d85f90e3adb0c  models/near-shoemaker.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Pioneer%2010/Pioneer%2010.glb" -o "models/pioneer-10.glb"
echo "81443a7fa01cca0dda878cd27692b3307f9c332c4eb8e55a844499d7b350573c  models/pioneer-10.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/3D%20Models/Viking%20Lander/Viking%20Lander.glb" -o "models/viking-lander.glb"
echo "1233dc2c96a1c0b08ca9a20f7ed9c09e0223f06f14f6ae6371349504c1929149  models/viking-lander.glb" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Earth%20%28A%29/Earth%20%28A%29.jpg" -o "textures/earth.jpg"
echo "5e18afce2860f02a215c09954fff5d3d1ca140cafa26c368d24d7636dd6705a7  textures/earth.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Mars/Mars.jpg" -o "textures/mars.jpg"
echo "12ec6bf02ebd42a246edc778cb2ce8c595b4d9f0892badf0bfff8abb2303c780  textures/mars.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Venus/Venus.jpg" -o "textures/venus.jpg"
echo "e395bced59e95339efbdd002d4a0bbbf81fe323a6694f3a4039120560c80e789  textures/venus.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Jupiter/Jupiter.jpg" -o "textures/jupiter.jpg"
echo "ac2d387f8ea56a59f45dea37993c779a730f49d7d9fdbc8d36c307a351b1f1a1  textures/jupiter.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Saturn/Saturn.jpg" -o "textures/saturn.jpg"
echo "d959a239e3d87630daf08e2a688dcbf315fe01b1fd474e55522770108f40aca7  textures/saturn.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Neptune/Neptune.jpg" -o "textures/neptune.jpg"
echo "e9bb2b7bcfb98d3f1adc6f2e20e833a00c11e9677238d8a00ae7431214ca70aa  textures/neptune.jpg" | sha256sum -c - || fail=1
curl -fsSL "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Moon/Moon.jpg" -o "images/moon-full-disc-photo.jpg"
echo "1318334a5089fb186d39996f60677b5f5b42cde74158ceff97b3e2283bfd41d4  images/moon-full-disc-photo.jpg" | sha256sum -c - || fail=1
[ "$fail" = 0 ] && echo "All assets match the pinned NASA versions." || { echo "CHECKSUM MISMATCH"; exit 1; }
