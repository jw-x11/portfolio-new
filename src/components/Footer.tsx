import { site } from "../content/site";

export function Footer() {
  return (
    <footer className="footer">
      <span>
        © {new Date().getFullYear()} {site.firstName} {site.lastName}
      </span>
      <span>Software engineer</span>
    </footer>
  );
}
