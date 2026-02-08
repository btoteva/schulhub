import React, { useState } from "react";
import { FaVolumeUp } from "react-icons/fa";

function speakText(text: string, lang: string = "de-DE") {
  if (!text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.trim());
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export interface SkeletonBone {
  de: string;
  bg: string;
}

export interface SkeletonPart {
  groupLabel: string;
  groupLabelBg?: string;
  imageUrl?: string;
  bones: SkeletonBone[];
}

interface SkeletonDiagramProps {
  title?: string;
  titleBg?: string;
  imageUrl?: string;
  parts: SkeletonPart[];
}

export function SkeletonDiagram({
  title,
  titleBg,
  imageUrl,
  parts,
}: SkeletonDiagramProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const toggleBone = (partIndex: number, boneIndex: number) => {
    const id = `${partIndex}-${boneIndex}`;
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {(title || titleBg) && (
        <div className="mb-4">
          {title && (
            <h4 className="text-xl font-bold text-cyan-300">{title}</h4>
          )}
          {titleBg && (
            <p className="text-gray-400 text-sm">{titleBg}</p>
          )}
        </div>
      )}

      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-600 bg-gray-900 mb-6">
          <img
            src={imageUrl}
            alt="Човешки скелет"
            className="w-full max-h-80 object-contain"
          />
        </div>
      )}

      <p className="text-gray-400 text-sm mb-4">
        Кликни върху кост, за да видиш превода на български.
      </p>

      <div className="space-y-8">
        {parts.map((part, partIndex) => (
          <div
            key={partIndex}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-600"
          >
            <h5 className="text-lg font-semibold text-amber-300 mb-1">
              {part.groupLabel}
            </h5>
            {part.groupLabelBg && (
              <p className="text-gray-500 text-sm mb-4">{part.groupLabelBg}</p>
            )}
            {part.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-600 bg-gray-900 mb-4 max-w-lg">
                <img
                  src={part.imageUrl}
                  alt=""
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {part.bones.map((bone, boneIndex) => {
                const id = `${partIndex}-${boneIndex}`;
                const isRevealed = revealedIds.has(id);
                return (
                  <div
                    key={boneIndex}
                    className={`relative text-left px-4 py-3 pb-10 rounded-lg border-2 transition-all min-h-[4rem] ${
                      isRevealed
                        ? "border-cyan-500 bg-cyan-900/30"
                        : "border-gray-600 bg-gray-700/50 hover:border-cyan-600/70 hover:bg-gray-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBone(partIndex, boneIndex)}
                      className="block w-full text-left pr-0"
                    >
                      <span className="text-white font-medium block">
                        {bone.de}
                      </span>
                      {isRevealed && (
                        <span className="text-cyan-200 text-sm block mt-1">
                          {bone.bg}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(bone.de);
                      }}
                      className="absolute bottom-2 right-2 z-10 p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                      title="Чети на глас"
                    >
                      <FaVolumeUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
