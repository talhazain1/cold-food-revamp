export default function Footer() {
  return (
    <footer className="bg-[#006847] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm">
        <p>© {new Date().getFullYear()} Ready2Cook. All rights reserved.</p>
        <p className="mt-1">ready2cook.co.uk</p>
      </div>
    </footer>
  );
}
