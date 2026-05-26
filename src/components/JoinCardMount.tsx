"use client";

import { useEffect, useState } from "react";

/** 카드(600px)를 뷰포트에 맞게 축소하고, 홀로그램 오버플로로 생기는 스크롤바를 숨깁니다. */
export default function JoinCardMount({
  children,
  cardRef,
}: {
  children: React.ReactNode;
  cardRef?: React.RefObject<HTMLDivElement>;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const maxW = Math.min(600, window.innerWidth - 32);
      setScale(Math.min(1, maxW / 600));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <div
        className="origin-top"
        style={{
          width: 600,
          height: 400 * scale,
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        <div ref={cardRef} className="h-[400px] w-[600px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
