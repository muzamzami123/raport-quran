import { Suspense } from "react";
import HomeGuruEvaluationPage from "@/app/page";

export const dynamic = "force-dynamic";
export const instant = false;

export default function ProgramDynamicRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fbfe] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#086288] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeGuruEvaluationPage />
    </Suspense>
  );
}

