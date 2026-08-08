import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

export function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({
      x: dragStart.current.posX + (e.clientX - dragStart.current.x),
      y: dragStart.current.posY + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  const toggleZoom = () => {
    if (scale > 1) {
      reset();
    } else {
      setScale(2.5);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 touch-none"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.min(s + 0.5, 5));
          }}
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ZoomIn className="size-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const next = Math.max(scale - 0.5, 1);
            setScale(next);
            if (next <= 1) setPos({ x: 0, y: 0 });
          }}
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ZoomOut className="size-5" />
        </button>
        <button
          onClick={onClose}
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <X className="size-5" />
        </button>
      </div>
      <img
        src={src}
        alt="Visualização"
        className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain select-none transition-transform duration-200"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          toggleZoom();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        draggable={false}
      />
    </div>
  );
}
