const article = document.querySelector("#manifesto");
const desktopToc = document.querySelector("#desktop-toc");
const mobileToc = document.querySelector("#mobile-toc");
const progressBar = document.querySelector("#progress-bar");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const inlineMarkdown = (value) => escapeHtml(value)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.+?)\*/g, "<em>$1</em>");

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (listType) html.push(`</${listType}>`);
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const unordered = line.match(/^-\s+(.+)$/);

    if (!line) {
      flushParagraph();
      closeList();
    } else if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (line === "---") {
      flushParagraph();
      closeList();
      html.push("<hr>");
    } else if (ordered || unordered) {
      flushParagraph();
      const nextType = ordered ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${inlineMarkdown((ordered || unordered)[1])}</li>`);
    } else {
      closeList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildNavigation() {
  const sections = [...article.querySelectorAll("h2")];
  const links = sections.map((heading) => {
    heading.id = slugify(heading.textContent);
    return `<a class="toc-link" href="#${heading.id}">${heading.textContent}</a>`;
  }).join("");

  desktopToc.innerHTML = links;
  mobileToc.innerHTML = links;

  const allLinks = [...document.querySelectorAll(".toc-link")];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).at(-1);
    if (!visible) return;
    allLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${visible.target.id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-15% 0px -72% 0px" });

  sections.forEach((section) => observer.observe(section));
  mobileToc.addEventListener("click", (event) => {
    if (event.target.matches("a")) event.target.closest("details").removeAttribute("open");
  });
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
  progressBar.style.width = `${progress}%`;
}

fetch("manifesto.md")
  .then((response) => {
    if (!response.ok) throw new Error("The manifesto could not be loaded.");
    return response.text();
  })
  .then((markdown) => {
    article.removeAttribute("aria-live");
    article.innerHTML = renderMarkdown(markdown);
    buildNavigation();
    updateProgress();
  })
  .catch(() => {
    article.innerHTML = '<p class="loading">The formatted document could not be opened. <a href="manifesto.md">Read the complete plain-text draft instead.</a></p>';
  });

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
