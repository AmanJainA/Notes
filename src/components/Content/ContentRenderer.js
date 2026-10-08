import React from "react";

/**
 * A "content block" coming from Supabase (topic_content.content, a jsonb array)
 * looks like one of these shapes:
 *
 *   { type: "heading", text: "History of C" }
 *   { type: "paragraph", text: "C is a general purpose..." }
 *   { type: "code", language: "c", code: "#include <stdio.h>\n..." }
 *   { type: "list", ordered: false, items: ["point one", "point two"] }
 *   { type: "image", src: "https://...", alt: "diagram", caption: "..." }
 *   { type: "note", variant: "info" | "warning" | "tip", text: "..." }
 *   { type: "table", headers: ["A","B"], rows: [["1","2"]] }
 *   { type: "divider" }
 *
 * Adding a new language/topic never touches this file - authors just add
 * rows/JSON in Supabase and it renders automatically.
 */
export default function ContentRenderer({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-muted">No content yet for this topic.</p>;
  }

  return (
    <div className="content-renderer">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "heading":
      return <h3 className="font-weight-bold mb-2 mt-4">{block.text}</h3>;

    case "subheading":
      return <h5 className="fw-semibold mt-3 mb-2">{block.text}</h5>;

    case "paragraph":
      return <p className="mb-3">{block.text}</p>;

    case "code":
      return (
        <figure className="code-block">
          {block.filename && (
            <div className="code-filename">{block.filename}</div>
          )}

          <div className="code-content">
            {block.code.split("\n").map((line, index) => (
              <div className="code-line" key={index}>
                <span className="code-line-number">{index + 1}</span>

                <span className="code-line-content">{line || " "}</span>
              </div>
            ))}
          </div>
        </figure>
      );

    case "list":
      return block.ordered ? (
        <ol>
      {block.items.map((item, index) => {
        if (typeof item === "string") {
          return <li key={index}>{item}</li>;
        }

        return (
          <li key={index}>
            {item.text}

            {item.children && item.children.length > 0 && (
              <ul>
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>{child}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  ) : (
    <ul>
      {block.items.map((item, index) => {
        if (typeof item === "string") {
          return <li key={index}>{item}</li>;
        }

        return (
          <li key={index}>
            {item.text}

            {item.children && item.children.length > 0 && (
              <ul>
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>{child}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
      );

    case "image":
      return (
        <figure className="text-center my-4">
          <img
            src={block.src}
            alt={block.alt || ""}
            className="img-fluid rounded shadow-sm"
            style={{ maxWidth: "90%" }}
          />
          {block.caption && (
            <figcaption className="text-muted small mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "note": {
      const variantClass =
        {
          warning: "alert-warning",
          tip: "alert-success",
          info: "alert-info",
        }[block.variant] || "alert-info";
      return (
        <div className={`alert ${variantClass} mb-3`}>
          {block.title && (
            <strong className="d-block mb-1">{block.title}</strong>
          )}
          {block.text}
        </div>
      );
    }

    case "table":
      return (
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "divider":
      return <hr className="my-4" />;

    default:
      return null;
  }
}
