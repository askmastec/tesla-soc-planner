export default function LegacyPlannerPage() {
  return (
    <main className="h-screen w-screen bg-black">
      <iframe
        title="Legacy Tesla day builder"
        src="/legacy/tesla_day_builder_simulator.html"
        className="h-full w-full border-0"
      />
    </main>
  );
}

