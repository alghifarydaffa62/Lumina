export default function Features() {
  return (
    <section className="py-20 px-4 bg-zinc-50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Feature One", "Feature Two", "Feature Three"].map((f, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-2">{f}</h3>
              <p className="text-zinc-500 text-sm">Placeholder description for {f}.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
