// Geometry-only GLTF validation. Uses the actual three.js parser/Draco decoder;
// strips texture references because this check has no browser, canvas or GPU.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const decoderUrl = new URL('../node_modules/three/examples/jsm/libs/draco/draco_decoder.js', import.meta.url);
const context = { module: { exports: {} }, exports: {}, require: createRequire(import.meta.url), __dirname: fileURLToPath(new URL('.', decoderUrl)), URL, process, console, Buffer, setTimeout, clearTimeout };
vm.runInNewContext(readFileSync(decoderUrl, 'utf8'), context, { filename: fileURLToPath(decoderUrl) });
const draco = await context.module.exports();
const loader = new GLTFLoader().setDRACOLoader({
  preload() {},
  decodeDracoFile(buffer, done, attributes, _types, _colorSpace, fail) {
    const decoder = new draco.Decoder(), input = new draco.DecoderBuffer(), mesh = new draco.Mesh();
    try {
      input.Init(new Int8Array(buffer), buffer.byteLength);
      const result = decoder.DecodeBufferToMesh(input, mesh);
      if (!result.ok()) throw Error(result.error_msg());
      const geometry = new BufferGeometry();
      for (const [name, id] of Object.entries(attributes)) {
        const attribute = decoder.GetAttributeByUniqueId(mesh, id);
        const values = new draco.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(mesh, attribute, values);
        const array = new Float32Array(values.size());
        for (let i = 0; i < array.length; i++) array[i] = values.GetValue(i);
        geometry.setAttribute(name, new Float32BufferAttribute(array, attribute.num_components()));
        draco.destroy(values);
      }
      const face = new draco.DracoInt32Array(), indices = [];
      for (let i = 0; i < mesh.num_faces(); i++) {
        decoder.GetFaceFromMesh(mesh, i, face);
        indices.push(face.GetValue(0), face.GetValue(1), face.GetValue(2));
      }
      draco.destroy(face); geometry.setIndex(indices); done(geometry);
    } catch (error) { fail(error); }
    finally { draco.destroy(mesh); draco.destroy(input); draco.destroy(decoder); }
  },
});

export async function loadModelHeadless(path) {
  const original = readFileSync(path);
  const jsonLength = original.readUInt32LE(12);
  const json = JSON.parse(original.subarray(20, 20 + jsonLength));
  json.materials = (json.materials ?? []).map((material) => ({ name: material.name, doubleSided: material.doubleSided }));
  delete json.images; delete json.textures; delete json.samplers;
  json.extensionsUsed = (json.extensionsUsed ?? []).filter(name => name === 'KHR_draco_mesh_compression');
  json.extensionsRequired = (json.extensionsRequired ?? []).filter(name => name === 'KHR_draco_mesh_compression');
  const raw = Buffer.from(JSON.stringify(json));
  const padded = Buffer.alloc(Math.ceil(raw.length / 4) * 4, 0x20); raw.copy(padded);
  const binary = original.subarray(20 + jsonLength);
  const out = Buffer.alloc(20 + padded.length + binary.length);
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
  out.writeUInt32LE(padded.length, 12); out.writeUInt32LE(0x4e4f534a, 16);
  padded.copy(out, 20); binary.copy(out, 20 + padded.length);
  return loader.parseAsync(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength), '');
}
