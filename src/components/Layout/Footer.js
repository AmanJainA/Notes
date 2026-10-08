import React from "react";

export default function Footer() {
  return (
    <footer className="footer py-4 text-center mt-4">
      <div className="container-fluid">
        <p className="mb-0 small">
          Copyright &copy; {new Date().getFullYear()} Notes | Build by Aman Jain
        </p>
      </div>
    </footer>
  );
}
