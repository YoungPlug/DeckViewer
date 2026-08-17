import { DeckViewer } from "./components/DeckViewer";
import { SpecSheet } from "./components/SpecSheet";

function App() {
  return (
    <div className="page">
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <span className="topbar-mark">◆ Tomorrow Skate Crew.</span>
        <span className="topbar-tag">NEW DROP</span>
      </header>

      <main className="hero">
        <section className="hero-copy">
          <p className="eyebrow">ARYANOV SERIES — DROP 2026</p>
          <h1 className="headline">
            VLAD
            <br />
            ARYANOV
          </h1>
          <p className="dek">
            A stiffer medium concave and a Higher Tail, pressed into 7-ply
            maple and finished with a Carbon Fiber at the Top. Built for
            board control at speed, not for standing still.
          </p>
          <SpecSheet />
        </section>

        <section className="viewer-frame">
          <DeckViewer />
        </section>
      </main>

      <footer className="footer">
        <span>MAPLE · PRESSED · LIMITED RUN OF 200</span>
        <span>$68</span>
      </footer>
    </div>
  );
}

export default App;
