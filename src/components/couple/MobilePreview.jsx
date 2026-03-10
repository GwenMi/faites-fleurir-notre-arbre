import { useState } from "react";
import { Smartphone, Tablet, Monitor, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVICES = [
  {
    key: "iphone_se",
    label: "iPhone SE",
    width: 375,
    height: 667,
    icon: Smartphone,
    bezel: 16,
    radius: 36,
    notch: false,
  },
  {
    key: "iphone_14",
    label: "iPhone 14",
    width: 390,
    height: 844,
    icon: Smartphone,
    bezel: 16,
    radius: 44,
    notch: true,
  },
  {
    key: "samsung",
    label: "Samsung S23",
    width: 360,
    height: 780,
    icon: Smartphone,
    bezel: 14,
    radius: 36,
    notch: false,
    punch: true,
  },
  {
    key: "ipad",
    label: "iPad Mini",
    width: 768,
    height: 1024,
    icon: Tablet,
    bezel: 20,
    radius: 20,
    notch: false,
  },
];

export default function MobilePreview({ event }) {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[1]);
  const [landscape, setLandscape] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const publicUrl = event?.public_url;

  const deviceW = landscape ? selectedDevice.height : selectedDevice.width;
  const deviceH = landscape ? selectedDevice.width : selectedDevice.height;

  // Scale to fit in panel (max ~520px height for phone)
  const maxH = selectedDevice.key === "ipad" ? 680 : 680;
  const scale = Math.min(1, maxH / (deviceH + selectedDevice.bezel * 2 + 60));

  const frameW = (deviceW + selectedDevice.bezel * 2) * scale;
  const frameH = (deviceH + selectedDevice.bezel * 2 + 60) * scale;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {DEVICES.map(device => {
            const Icon = device.icon;
            return (
              <button
                key={device.key}
                onClick={() => setSelectedDevice(device)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                  selectedDevice.key === device.key
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {device.label}
                <span className="text-gray-400 font-normal">{device.width}px</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLandscape(l => !l)}
            className={`p-2 rounded-xl border transition text-xs ${landscape ? "bg-rose-50 border-rose-200 text-rose-500" : "border-gray-100 text-gray-400 hover:text-gray-600"}`}
            title="Rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-600 transition"
            title="Recharger"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                Ouvrir
              </Button>
            </a>
          )}
        </div>
      </div>

      {!publicUrl ? (
        <div className="text-center py-20 text-gray-400">
          <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Aucun site public associé à cet événement.</p>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          {/* Phone/tablet shell */}
          <div
            style={{
              width: frameW,
              height: frameH,
              position: "relative",
            }}
          >
            {/* Outer shell */}
            <div
              style={{
                width: frameW,
                height: frameH,
                background: "linear-gradient(145deg, #2d2d2d, #1a1a1a)",
                borderRadius: selectedDevice.radius * scale,
                boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.5)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: `${selectedDevice.bezel * scale}px`,
              }}
            >
              {/* Top notch (iPhone) */}
              {selectedDevice.notch && !landscape && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 126 * scale,
                  height: 34 * scale,
                  background: "#1a1a1a",
                  borderBottomLeftRadius: 18 * scale,
                  borderBottomRightRadius: 18 * scale,
                  zIndex: 10,
                }} />
              )}

              {/* Punch hole (Samsung) */}
              {selectedDevice.punch && !landscape && (
                <div style={{
                  position: "absolute",
                  top: selectedDevice.bezel * scale + 10 * scale,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 12 * scale,
                  height: 12 * scale,
                  background: "#111",
                  borderRadius: "50%",
                  zIndex: 10,
                }} />
              )}

              {/* Side buttons */}
              <div style={{
                position: "absolute",
                right: -3 * scale,
                top: 100 * scale,
                width: 3 * scale,
                height: 60 * scale,
                background: "#222",
                borderRadius: 2,
              }} />
              <div style={{
                position: "absolute",
                left: -3 * scale,
                top: 80 * scale,
                width: 3 * scale,
                height: 35 * scale,
                background: "#222",
                borderRadius: 2,
              }} />
              <div style={{
                position: "absolute",
                left: -3 * scale,
                top: 125 * scale,
                width: 3 * scale,
                height: 35 * scale,
                background: "#222",
                borderRadius: 2,
              }} />

              {/* Screen bezel inner */}
              <div style={{
                width: "100%",
                flex: 1,
                background: "#000",
                borderRadius: (selectedDevice.radius - 6) * scale,
                overflow: "hidden",
                position: "relative",
              }}>
                {/* Status bar */}
                <div style={{
                  height: selectedDevice.notch ? 44 * scale : 20 * scale,
                  background: "#000",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  padding: `0 ${16 * scale}px ${4 * scale}px`,
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#fff", fontSize: 10 * scale, fontWeight: 600 }}>9:41</span>
                  <span style={{ color: "#fff", fontSize: 9 * scale }}>●●●●  WiFi  🔋</span>
                </div>

                {/* iframe */}
                <iframe
                  key={iframeKey}
                  src={publicUrl}
                  style={{
                    width: deviceW,
                    height: deviceH,
                    border: "none",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    display: "block",
                  }}
                  title="Aperçu mobile"
                />
              </div>

              {/* Home indicator (iPhone 14) */}
              {selectedDevice.notch && !landscape && (
                <div style={{
                  width: 100 * scale,
                  height: 5 * scale,
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: 3 * scale,
                  marginTop: 6 * scale,
                }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Device info */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          {selectedDevice.label} · {landscape ? `${selectedDevice.height}×${selectedDevice.width}` : `${selectedDevice.width}×${selectedDevice.height}`}px
          {landscape && " · paysage"}
        </p>
      </div>
    </div>
  );
}