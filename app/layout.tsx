import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <header style={styles.header}>
          <Link href="/" style={styles.logo}>
            PDF Convertly
          </Link>
          <nav style={styles.nav}>
            <Link href="/pdf-to-word" style={styles.navLink}>PDF to Word</Link>
            <Link href="/word-to-pdf" style={styles.navLink}>Word to PDF</Link>
            <Link href="/jpg-to-pdf" style={styles.navLink}>JPG to PDF</Link>
            <Link href="/merge-pdf" style={styles.navLink}>Merge</Link>
            <Link href="/compress-pdf" style={styles.navLink}>Compress</Link>
            <Link href="/organize-pdf" style={styles.navLink}>Organize</Link>
          </nav>
        </header>

        <main style={styles.main}>{children}</main>

        <section style={styles.privacy}>
          <strong>Your privacy matters.</strong>
          <span>
            Files are processed securely and automatically deleted after conversion.
            We do not store or share your documents.
          </span>
        </section>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} PDF Convertly
        </footer>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "radial-gradient(circle at top, #0f172a, #020617)",
    color: "#e5e7eb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid #1e293b",
    backdropFilter: "blur(8px)",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: "#a5b4fc",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    gap: 20,
  },
  navLink: {
    color: "#c7d2fe",
    textDecoration: "none",
    fontSize: 14,
  },
  main: {
    flex: 1,
    padding: "60px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
  },
  privacy: {
    maxWidth: 900,
    margin: "0 auto 40px",
    padding: "16px 20px",
    borderRadius: 12,
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.25)",
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    textAlign: "center",
    color: "#c7d2fe",
  },
  footer: {
    textAlign: "center",
    padding: 20,
    fontSize: 13,
    color: "#64748b",
    borderTop: "1px solid #1e293b",
  },
};
