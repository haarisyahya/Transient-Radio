import Logo from "@/components/Logo";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--tr-bg)" }}>
      {/* TOP LEFT — replace Logo with animation component once received from Max */}
      <div style={{ position: "fixed", top: "24px", left: "32px", zIndex: 10 }}>
        <Logo href="/" />
      </div>

      {/* About content */}
      <main id="main-content" style={{ padding: "80px 32px 80px", maxWidth: "560px" }}>
        <h1 className="sr-only">About Transient Radio</h1>
        <div style={{ marginTop: "24px" }}>
          <p
            style={{
              color: "var(--tr-text-muted)",
              fontSize: "13px",
              lineHeight: "1.9",
              marginBottom: "24px",
            }}
          >
            Transient Radio is a nomadic, internet-station archive exploring music beyond genre and geography. Broadcasting from Toronto to the world.
          </p>

          <p
            style={{
              color: "var(--tr-text-muted)",
              fontSize: "13px",
              lineHeight: "1.9",
              marginBottom: "24px",
            }}
          >
            {/* Add second paragraph here */}
          </p>

          {/* Optional: contact / social links */}
          {/*
          <div style={{ marginTop: "48px" }}>
            <a
              href="mailto:your@email.com"
              style={{ color: "var(--tr-text-dim)", fontSize: "12px", letterSpacing: "0.05em" }}
            >
              contact
            </a>
          </div>
          */}
        </div>
      </main>
    </div>
  );
}
