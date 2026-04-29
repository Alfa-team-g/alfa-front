export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Alfa Front</h1>
        <p className="text-muted-foreground">
          Aplicacao online e pronta para disparar o scan manual via GitHub Actions.
        </p>
        <p className="text-sm text-muted-foreground">
          Endpoint de trigger: <code>/api/scans/trigger</code>
        </p>
      </div>
    </main>
  );
}
