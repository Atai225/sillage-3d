import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { NOTES, NOTES_BY_ID } from '../data/notes';
import type { FormulaItem, Layer, Note } from '../types';
import { noteIntensity } from '../utils/perfumeryMath';

interface Scene3DProps {
  formula: FormulaItem[];
  selectedId: string | null;
  minutes: number;
  highlightIds: string[];
  paused?: boolean;
  onSelect: (id: string | null) => void;
  onAdd: (id: string) => void;
}

interface NodeObj {
  note: Note;
  group: THREE.Group;
  core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Sprite;
  ring: THREE.Sprite;
  hit: THREE.Mesh;
  label: CSS2DObject;
  synEl: HTMLSpanElement;
  size: number;
  cur: { op: number; scale: number; glow: number; label: number };
  lastLabelOp: number;
  lastClass: string;
}

interface EdgeObj {
  a: string;
  b: string;
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  classic: boolean;
  cur: number;
}

const LAYER_Y: Record<Layer, number> = { top: 5.2, heart: 0.4, base: -4.8, molecule: 0 };
const LAYER_R: Record<Layer, number> = { top: 3.3, heart: 5, base: 6.6, molecule: 9.8 };
const LAYER_OFFSET: Record<Layer, number> = { top: 0.2, heart: 0.9, base: 0.4, molecule: 0.35 };

function computePositions(): Record<string, THREE.Vector3> {
  const res: Record<string, THREE.Vector3> = {};
  (['top', 'heart', 'base', 'molecule'] as Layer[]).forEach((layer) => {
    const list = NOTES.filter((n) => n.layer === layer);
    list.forEach((n, i) => {
      const angle = (i / list.length) * Math.PI * 2 + LAYER_OFFSET[layer];
      if (layer === 'molecule') {
        res[n.id] = new THREE.Vector3(Math.cos(angle) * LAYER_R.molecule, Math.sin(angle * 2) * 1.4 + 0.2, Math.sin(angle) * LAYER_R.molecule);
        return;
      }
      const r = LAYER_R[layer] + (i % 2 ? 0.55 : -0.45);
      const y = LAYER_Y[layer] + ((i % 3) - 1) * 0.6;
      res[n.id] = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
    });
  });
  return res;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.65)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.16)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeRingTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.stroke();
  return new THREE.CanvasTexture(c);
}

export default function Scene3D(props: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Рендереры ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050507, 1);
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.018);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
    camera.position.set(0, 4.5, 23);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 7;
    controls.maxDistance = 45;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.target.set(0, 0, 0);

    const disposables: { dispose: () => void }[] = [];
    const glowTex = makeGlowTexture();
    const ringTex = makeRingTexture();
    disposables.push(glowTex, ringTex);

    // ── Звёздная пыль ──
    const dustCount = 1800;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 25 + Math.random() * 60;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      dustPos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      dustPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ size: 0.16, color: 0xe7d9b0, transparent: true, opacity: 0.45, depthWrite: false, map: glowTex, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    disposables.push(dustGeo, dustMat);

    // Мелкая пыльца внутри пирамиды
    const pollenCount = 260;
    const pollenPos = new Float32Array(pollenCount * 3);
    for (let i = 0; i < pollenCount; i++) {
      const r = Math.random() * 11;
      const th = Math.random() * Math.PI * 2;
      pollenPos[i * 3] = Math.cos(th) * r;
      pollenPos[i * 3 + 1] = (Math.random() - 0.5) * 13;
      pollenPos[i * 3 + 2] = Math.sin(th) * r;
    }
    const pollenGeo = new THREE.BufferGeometry();
    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3));
    const pollenMat = new THREE.PointsMaterial({ size: 0.09, color: 0xd4af37, transparent: true, opacity: 0.35, depthWrite: false, map: glowTex, blending: THREE.AdditiveBlending });
    const pollen = new THREE.Points(pollenGeo, pollenMat);
    scene.add(pollen);
    disposables.push(pollenGeo, pollenMat);

    // ── Направляющие кольца слоёв ──
    (['top', 'heart', 'base', 'molecule'] as Layer[]).forEach((layer) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        const y = layer === 'molecule' ? Math.sin(a * 2) * 1.4 + 0.2 : LAYER_Y[layer];
        pts.push(new THREE.Vector3(Math.cos(a) * LAYER_R[layer], y, Math.sin(a) * LAYER_R[layer]));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({ color: layer === 'molecule' ? 0x38bdf8 : 0xffffff, transparent: true, opacity: layer === 'molecule' ? 0.1 : 0.05 });
      scene.add(new THREE.Line(g, m));
      disposables.push(g, m);
    });

    // ── Узлы ──
    const positions = computePositions();
    const sphereGeo = new THREE.SphereGeometry(1, 24, 18);
    const hitGeo = new THREE.SphereGeometry(1, 8, 6);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    disposables.push(sphereGeo, hitGeo, hitMat);

    const nodes: NodeObj[] = [];
    const nodeById = new Map<string, NodeObj>();
    const hitMeshes: THREE.Mesh[] = [];

    for (const note of NOTES) {
      const size = 0.16 + note.strength * 0.022;
      const group = new THREE.Group();
      group.position.copy(positions[note.id]);

      const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(note.color), transparent: true, opacity: 0.9 });
      const core = new THREE.Mesh(sphereGeo, coreMat);
      core.scale.setScalar(size);
      group.add(core);

      const haloMat = new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(note.color), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
      const halo = new THREE.Sprite(haloMat);
      halo.scale.setScalar(size * 7);
      group.add(halo);

      const ringMat = new THREE.SpriteMaterial({ map: ringTex, color: 0x38bdf8, transparent: true, opacity: 0, depthWrite: false });
      const ring = new THREE.Sprite(ringMat);
      ring.scale.setScalar(size * 6);
      group.add(ring);

      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.scale.setScalar(Math.max(0.55, size * 2.6));
      hit.userData.noteId = note.id;
      group.add(hit);
      hitMeshes.push(hit);

      const el = document.createElement('div');
      el.className = 'node-label';
      el.textContent = note.name;
      const synEl = document.createElement('span');
      synEl.className = 'syn';
      el.appendChild(synEl);
      el.style.borderLeft = `2px solid ${note.color}`;
      const label = new CSS2DObject(el);
      label.position.set(0, size + 0.42, 0);
      group.add(label);

      scene.add(group);
      disposables.push(coreMat, haloMat, ringMat);
      const obj: NodeObj = { note, group, core, halo, ring, hit, label, synEl, size, cur: { op: 0, scale: 0.2, glow: 0, label: 0 }, lastLabelOp: -1, lastClass: '' };
      nodes.push(obj);
      nodeById.set(note.id, obj);
    }

    // ── Связи ──
    const edges: EdgeObj[] = [];
    const seen = new Set<string>();
    for (const note of NOTES) {
      for (const link of note.links) {
        const key = [note.id, link.targetId].sort().join('|');
        if (seen.has(key) || !positions[link.targetId]) continue;
        seen.add(key);
        const g = new THREE.BufferGeometry().setFromPoints([positions[note.id], positions[link.targetId]]);
        const classic = link.type === 'classic';
        const m = new THREE.LineBasicMaterial({ color: classic ? 0xffffff : 0xd4af37, transparent: true, opacity: 0.1, depthWrite: false });
        const line = new THREE.Line(g, m);
        scene.add(line);
        disposables.push(g, m);
        edges.push({ a: note.id, b: link.targetId, line, classic, cur: 0 });
      }
    }

    // ── Размер ──
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 700 ? 30 : camera.position.z;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── Взаимодействие ──
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos: { x: number; y: number } | null = null;

    const pick = (ev: { clientX: number; clientY: number }): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      return hits.length ? (hits[0].object.userData.noteId as string) : null;
    };
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (moved > 5) return;
      propsRef.current.onSelect(pick(e));
    };
    const onDblClick = (e: MouseEvent) => {
      const id = pick(e);
      if (id) propsRef.current.onAdd(id);
    };
    let hoverFrame = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (hoverFrame) return;
      hoverFrame = requestAnimationFrame(() => {
        hoverFrame = 0;
        renderer.domElement.style.cursor = pick(e) ? 'pointer' : 'grab';
      });
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('dblclick', onDblClick);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // ── Цикл анимации ──
    const clock = new THREE.Clock();
    let raf = 0;
    const k = 0.1;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = propsRef.current;
      if (p.paused) return;
      const t = clock.getElapsedTime();

      const formulaMap = new Map(p.formula.map((f) => [f.noteId, f.drops]));
      const hasFormula = formulaMap.size > 0;
      const sel = p.selectedId && NOTES_BY_ID[p.selectedId] ? p.selectedId : null;
      const linked = new Map<string, number>();
      if (sel) NOTES_BY_ID[sel].links.forEach((l) => linked.set(l.targetId, l.synergy));
      const highlight = new Set(p.highlightIds);
      const intensities = new Map<string, number>();

      controls.autoRotate = !sel;

      for (const n of nodes) {
        const id = n.note.id;
        let op = 0.85;
        let scale = 1;
        let glow = 0.45;
        let labelOp = 0.75;
        let cls = 'node-label';
        let syn = '';

        if (sel) {
          if (id === sel) {
            op = 1; scale = 1.45; glow = 1; labelOp = 1; cls += ' is-selected';
          } else if (linked.has(id)) {
            op = 0.95; scale = 1.1; glow = 0.75; labelOp = 1; syn = `${linked.get(id)}%`; cls += ' show-syn';
          } else {
            op = 0.12; scale = 0.8; glow = 0.05; labelOp = 0.12;
          }
        } else if (hasFormula) {
          if (formulaMap.has(id)) {
            const inten = noteIntensity(n.note, p.minutes);
            intensities.set(id, inten);
            const drops = formulaMap.get(id) ?? 1;
            op = Math.max(0.12, inten);
            // верхние ноты на старте слегка «вспухают»
            const boost = n.note.layer === 'top' && p.minutes < 30 ? 0.25 : 0;
            scale = 0.7 + inten * 0.55 + boost + Math.min(0.25, drops / 60);
            glow = 0.1 + inten * 1.05;
            labelOp = 0.3 + inten * 0.7;
          } else {
            op = 0.22; scale = 0.75; glow = 0.06; labelOp = 0.22;
          }
        }
        if (highlight.has(id)) {
          op = Math.max(op, 0.95);
          glow = Math.max(glow, 0.7);
          labelOp = 1;
          cls += ' is-suggested';
        }

        n.cur.op += (op - n.cur.op) * k;
        n.cur.scale += (scale - n.cur.scale) * k;
        n.cur.glow += (glow - n.cur.glow) * k;
        n.cur.label += (labelOp - n.cur.label) * k;

        const breathe = 1 + Math.sin(t * 1.6 + n.group.position.x) * 0.04 * n.cur.glow;
        n.core.material.opacity = n.cur.op;
        n.core.scale.setScalar(n.size * n.cur.scale * breathe);
        (n.halo.material as THREE.SpriteMaterial).opacity = Math.min(1, n.cur.glow * 0.8);
        n.halo.scale.setScalar(n.size * 7 * (0.6 + n.cur.glow * 0.7) * breathe);

        const ringMat = n.ring.material as THREE.SpriteMaterial;
        const ringTarget = highlight.has(id) ? 0.55 + Math.sin(t * 4) * 0.35 : 0;
        ringMat.opacity += (ringTarget - ringMat.opacity) * 0.2;
        ringMat.rotation = t * 0.8;

        if (Math.abs(n.cur.label - n.lastLabelOp) > 0.01) {
          n.label.element.style.opacity = n.cur.label.toFixed(2);
          n.lastLabelOp = n.cur.label;
        }
        if (cls !== n.lastClass) {
          n.label.element.className = cls;
          n.lastClass = cls;
        }
        if (n.synEl.textContent !== syn) n.synEl.textContent = syn;
      }

      for (const e of edges) {
        let target: number;
        if (sel) {
          target = e.a === sel || e.b === sel ? 0.8 : 0.015;
        } else if (hasFormula) {
          const ia = intensities.get(e.a);
          const ib = intensities.get(e.b);
          if (ia !== undefined && ib !== undefined) target = 0.12 + Math.min(ia, ib) * 0.6;
          else if (ia !== undefined || ib !== undefined) target = 0.035;
          else target = 0.012;
        } else {
          target = e.classic ? 0.09 : 0.14;
        }
        e.cur += (target - e.cur) * k;
        e.line.material.opacity = e.cur;
      }

      dust.rotation.y = t * 0.006;
      pollen.rotation.y = -t * 0.02;
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // ── Очистка ресурсов Three.js ──
    return () => {
      cancelAnimationFrame(raf);
      if (hoverFrame) cancelAnimationFrame(hoverFrame);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('dblclick', onDblClick);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      nodes.forEach((n) => n.group.remove(n.label));
      disposables.forEach((d) => d.dispose());
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentNode === container) container.removeChild(labelRenderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 overflow-hidden" />;
}
