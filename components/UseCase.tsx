export default function UseCase() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-12">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Use Case One", "Use Case Two", "Use Case Three", "Use Case Four"].map(
            (uc, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-6 shadow-sm">
                <h3 className="text-xl font-medium mb-2">{uc}</h3>
                <p className="text-zinc-500 text-sm">
                  Placeholder description for {uc}.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
