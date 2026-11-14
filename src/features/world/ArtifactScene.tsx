// Tầng 3: viewer model GLB chính thức của NASA. Chỉ tải khi vào tầng này (lazy),
// không sửa hình dạng model: chỉ đặt vào giữa và co giãn đều cho vừa khung.

import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Box3, Sphere } from 'three';
import type { Group, Material, Mesh, Object3D, Texture } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// 8/9 model trong public/assets/models BẮT BUỘC cần Draco. Bộ giải mã lấy từ gói `three`
// đã cài (Vite đóng gói thành file tĩnh), không gọi CDN bên ngoài.
import dracoWrapperUrl from 'three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url';
import dracoWasmUrl from 'three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url';
import { MODEL_RADIUS } from './layout';

let sharedDraco: DRACOLoader | null = null;
function configureLoader(loader: GLTFLoader) {
  if (!sharedDraco) {
    sharedDraco = new DRACOLoader();
    sharedDraco.setDecoderPath({ js: dracoWrapperUrl, wasm: dracoWasmUrl });
  }
  loader.setDRACOLoader(sharedDraco);
}

// ---- giải phóng tài nguyên khi rời viewer ----
// Trì hoãn một nhịp để StrictMode (mount → unmount → mount) không hủy model đang dùng.
const pendingDisposals = new Map<string, ReturnType<typeof setTimeout>>();

function disposeObject(root: Object3D) {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && (value as Texture).isTexture) (value as Texture).dispose();
      }
      material.dispose();
    }
  });
}

function scheduleDisposal(url: string, root: Object3D) {
  cancelDisposal(url);
  pendingDisposals.set(
    url,
    setTimeout(() => {
      pendingDisposals.delete(url);
      disposeObject(root);
      useLoader.clear(GLTFLoader, url);
    }, 250),
  );
}

function cancelDisposal(url: string) {
  const timer = pendingDisposals.get(url);
  if (timer !== undefined) {
    clearTimeout(timer);
    pendingDisposals.delete(url);
  }
}

function Model({ url, onReady }: { url: string; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, url, configureLoader);
  const spin = useRef<Group>(null);

  const fit = useMemo(() => {
    const sphere = new Box3().setFromObject(gltf.scene).getBoundingSphere(new Sphere());
    const scale = sphere.radius > 0 ? MODEL_RADIUS / sphere.radius : 1;
    return { scale, offset: sphere.center.clone().multiplyScalar(-scale) };
  }, [gltf]);

  useEffect(() => {
    cancelDisposal(url);
    onReady();
    return () => scheduleDisposal(url, gltf.scene);
  }, [url, gltf, onReady]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={spin}>
      <group position={fit.offset} scale={fit.scale}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  );
}

interface BoundaryProps {
  url: string;
  onError: () => void;
  children: ReactNode;
}

class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[world] 3D model failed to load: ${this.props.url}`, error);
    useLoader.clear(GLTFLoader, this.props.url); // lần vào sau được thử lại
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface ArtifactSceneProps {
  /** null => không có model: cảnh chỉ còn nền sao, lớp HTML hiển thị ảnh thay thế. */
  modelUrl: string | null;
  onReady: () => void;
  onError: () => void;
}

export function ArtifactScene({ modelUrl, onReady, onError }: ArtifactSceneProps) {
  return (
    <group>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={['#ffffff', '#30364a', 0.9]} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.9} />
      {modelUrl && (
        <ModelBoundary key={modelUrl} url={modelUrl} onError={onError}>
          <Suspense fallback={null}>
            <Model url={modelUrl} onReady={onReady} />
          </Suspense>
        </ModelBoundary>
      )}
    </group>
  );
}
