import Link from "next/link";
import {
  FileText,
  FileUp,
  Image,
  Layers,
  Archive,
  ListOrdered,
} from "lucide-react";

export default function HomePage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>All PDF Tools in One Place</h1>
        <p style={styles.subtitle}>
          Convert, merge, compress, and organize your documents securely and fast.
        </p>
        <div style={styles.actions}>
          <Link href="#tools" style={styles.primaryBtn}>
            Get Started
          </Link>
          <Link href="#tools" style={styles.secondaryBtn}>
            View Tools
          </Link>
        </div>
      </section>

      <section id="tools" style={styles.grid}>
        <ToolCard
          href="/pdf-to-word"
          icon={<FileText size={28} />}
          title="PDF to Word"
          description="Convert PDFs to editable Word files."
        />
        <ToolCard
          href="/word-to-pdf"
          icon={<FileUp size={28} />}
          title="Word to PDF"
          description="Turn Word documents into PDFs."
        />
        <ToolCard
          href="/jpg-to-pdf"
          icon={<Image size={28} />}
          title="JPG to PDF"
          description="Convert images into PDF files."
        />
        <ToolCard
          href="/merge-pdf"
          icon={<Layers size={28} />}
          title="Merge PDF"
          description="Combine multiple PDFs into one."
        />
        <ToolCard
          href="/compress-pdf"
          icon={<Archive size={28} />}
          title="Compress PDF"
          description="Reduce PDF size without quality loss."
        />
        <ToolCard
          href="/organize-pdf"
          icon={<ListOrdered size={28} />}
          title="Organize PDF"
          description="Reorder, rotate, or delete pages."
        />
      </section>
    </main>
  );
}

function ToolCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} style={styles.card}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{description}</p>
      <span style={styles.open}>Open →</span>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    padding: "80px 24px",
    background:
      "radial-gradient(ellipse at top, #0f172a 0%, #020617 60%)",
    color: "#e5e7eb",
  },
  hero: {
    maxWidth: 900,
    margin: "0 auto 80px",
    textAlign: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#c7d2fe",
    marginBottom: 32,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "12px 28px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "12px 28px",
    border: "1px solid #6366f1",
    color: "#c7d2fe",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
  },
  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 24,
  },
  card: {
    background: "rgba(2,6,23,0.8)",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 24,
    textDecoration: "none",
    color: "#e5e7eb",
    transition: "transform 0.15s ease, border 0.15s ease",
  },
  icon: {
    color: "#818cf8",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  open: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: 600,
  },
};
