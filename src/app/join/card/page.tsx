import { Suspense } from "react";
import JoinCardViewerClient from "./JoinCardViewerClient";

export const metadata = {
  title: "입교 카드 — Ripple Church",
};

export default function JoinCardPage() {
  return (
    <Suspense>
      <JoinCardViewerClient />
    </Suspense>
  );
}

