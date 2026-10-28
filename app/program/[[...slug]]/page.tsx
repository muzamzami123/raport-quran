import HomeGuruEvaluationPage from "@/app/page";

// Entire client evaluation flow depends on runtime URL segments via usePathname().
export const instant = false;

export default function ProgramDynamicRoutePage() {
  return <HomeGuruEvaluationPage />;
}

