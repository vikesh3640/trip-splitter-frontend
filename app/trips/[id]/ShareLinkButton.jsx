"use client";

export default function ShareLinkButton({ slug }) {
  if (!slug) return null;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/public/${slug}`
      : `/public/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Public link copied!");
    } catch {
      alert(`Public URL: ${url}`);
    }
  };

  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
      title="Copy public view link"
      type="button"
    >
      Share
    </button>
  );
}
