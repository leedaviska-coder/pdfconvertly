export default function WordToPdfPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Word to PDF</h1>
      <p>Convert Word documents to PDF</p>

      <form
        action="/api/word-to-pdf"
        method="post"
        encType="multipart/form-data"
      >
        <input
          type="file"
          name="file"
          accept=".doc,.docx"
          required
        />
        <br /><br />
        <button type="submit">Convert to PDF</button>
      </form>
    </main>
  );
}
