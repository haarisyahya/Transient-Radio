"use client";

import { useRef, useState } from "react";
import Logo from "@/components/Logo";

// Formspree 
const FORMSPREE_ID = "mzdanppl";
// Note: file uploads (mix + photo) require Formspree's Gold plan. Might have to use Supabase


type Status = "idle" | "submitting" | "success" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  borderBottom: "1px solid var(--tr-border)",
  color: "var(--tr-text)",
  fontSize: "13px",
  fontFamily: "inherit",
  padding: "10px 0",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "none",
  display: "block",
  lineHeight: "1.8",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--tr-text-dim)",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "40px",
};

const requiredMark: React.CSSProperties = {
  color: "var(--tr-text-dim)",
  marginLeft: "2px",
};

// Custom file picker 
interface FileFieldProps {
  id: string;
  name: string;
  required?: boolean;
  accept: string;
  hint: string;
}

function FileField({ id, name, required, accept, hint }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
  }

  function handleRemove() {
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
  }

  return (
    <div>
      {/* Hidden real input — FormData picks this up on submit */}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required && !fileName}
        onChange={handleChange}
        style={{ display: "none" }}
        aria-hidden
      />

      <p
        style={{
          color: "var(--tr-text-dim)",
          fontSize: "11px",
          marginBottom: "14px",
          lineHeight: "1.6",
        }}
      >
        {hint}
      </p>

      {fileName ? (
        // File selected — show name + remove button
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid var(--tr-border)",
            padding: "10px 0",
          }}
        >
          <span
            style={{
              flex: 1,
              color: "var(--tr-text-muted)",
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fileName}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: "none",
              border: "none",
              color: "var(--tr-text-dim)",
              fontSize: "11px",
              fontFamily: "inherit",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--tr-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--tr-text-dim)")
            }
          >
            Remove
          </button>
        </div>
      ) : (
        // No file yet — show trigger button
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--tr-border)",
            color: "var(--tr-text-dim)",
            fontSize: "13px",
            fontFamily: "inherit",
            cursor: "pointer",
            padding: "10px 0",
            width: "100%",
            textAlign: "left",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--tr-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--tr-text-dim)")
          }
        >
          Add File
        </button>
      )}
    </div>
  );
}


export default function SubmitPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMessage(
          json?.errors?.[0]?.message ?? "Something went wrong. Please try again."
        );
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--tr-bg)" }}>
      {/* TOP LEFT — replace Logo with animation component once received from Max */}
      <div style={{ position: "fixed", top: "24px", left: "32px", zIndex: 10 }}>
        <Logo href="/" />
      </div>

      {/* Main content */}
      <main id="main-content" style={{ padding: "120px 32px 120px", maxWidth: "560px" }}>
        <h1
          style={{
            color: "var(--tr-text-muted)",
            fontSize: "13px",
            lineHeight: "1.8",
            fontWeight: "inherit",
            margin: "0 0 8px",
            marginTop: "24px",
          }}
        >
          Submit Your Mix
        </h1>

        {/* Intro text */}
        <div
          style={{
            color: "var(--tr-text-dim)",
            fontSize: "12px",
            lineHeight: "1.9",
            marginBottom: "56px",
          }}
        >
          <p style={{ marginBottom: "6px" }}>
            Thanks so much for wanting to share a mix with us.
          </p>
          <p style={{ marginBottom: "6px" }}>
            Mix length should be{" "}
            <span style={{ color: "var(--tr-text-muted)" }}>
              1 hour to 1 hour 30 minutes
            </span>
            .
          </p>
          <p style={{ marginBottom: "6px" }}>All genres are welcome.</p>
          <p style={{ marginBottom: "6px" }}>
            We&apos;ll feature 4 mixes each month, dropping one every week. All
            selected mixes will go up on our new site.
          </p>
          <p>
            If your mix is selected, we&apos;ll reach out to let you know when
            it&apos;s scheduled and share upload details.
          </p>
        </div>

        {/* Screen reader status announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {status === "success" && "Your mix has been submitted. We'll be in touch."}
          {status === "error" && errorMessage}
        </div>

        {status === "success" ? (
          <div>
            <p
              style={{
                color: "var(--tr-text-muted)",
                fontSize: "13px",
                lineHeight: "1.8",
                marginBottom: "32px",
              }}
            >
              Received. We&apos;ll be in touch.
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{
                background: "none",
                border: "none",
                color: "var(--tr-text-dim)",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--tr-text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--tr-text-dim)")
              }
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* 1. Full Name */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="full_name">
                Full Name<span style={requiredMark}>*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                style={inputStyle}
              />
            </div>

            {/* 2. Artist Name */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="artist_name">
                Artist Name<span style={requiredMark}>*</span>
              </label>
              <input
                id="artist_name"
                name="artist_name"
                type="text"
                required
                autoComplete="off"
                style={inputStyle}
              />
            </div>

            {/* 3. Email Address */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="email">
                Email Address<span style={requiredMark}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {/* 4. Social Media */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="social_media">
                Social Media: Instagram and/or Resident Advisor
                <span style={requiredMark}>*</span>
              </label>
              <input
                id="social_media"
                name="social_media"
                type="text"
                required
                autoComplete="off"
                style={inputStyle}
              />
            </div>

            {/* 5. Concept */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="concept">
                Describe your proposed concept of the mix
                <span style={requiredMark}>*</span>
              </label>
              <textarea
                id="concept"
                name="concept"
                rows={4}
                required
                style={textareaStyle}
              />
            </div>

            {/* 6. Upload Your Mix */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="mix_file">
                Upload Your Mix<span style={requiredMark}>*</span>
              </label>
              <FileField
                id="mix_file"
                name="mix_file"
                required
                accept="audio/*,video/*"
                hint="Audio or video. Max 100 MB."
              />
            </div>

            {/* 7. Photo */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="photo_file">
                Upload a photo to accompany your set
                <span style={requiredMark}>*</span>
              </label>
              <FileField
                id="photo_file"
                name="photo_file"
                required
                accept=".pdf,image/*"
                hint="For social media and mix promotion. PDF or image. Max 100 MB."
              />
            </div>

            {/* 8. Bio */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="bio">
                Provide a short bio of yourself
                <span style={requiredMark}>*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                required
                style={textareaStyle}
              />
            </div>

            {/* 9. Anything else */}
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="anything_else">
                Anything else you&apos;d like to add?
              </label>
              <textarea
                id="anything_else"
                name="anything_else"
                rows={3}
                style={textareaStyle}
              />
            </div>

            {status === "error" && (
              <p
                id="submit-error"
                role="alert"
                style={{
                  color: "var(--tr-text-muted)",
                  fontSize: "12px",
                  marginBottom: "24px",
                }}
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              aria-describedby={status === "error" ? "submit-error" : undefined}
              style={{
                background: "none",
                border: "1px solid var(--tr-border)",
                color: status === "submitting" ? "var(--tr-text-dim)" : "var(--tr-text-muted)",
                fontSize: "11px",
                fontFamily: "inherit",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: status === "submitting" ? "default" : "pointer",
                padding: "8px 14px",
                transition: "color 0.15s ease, border-color 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                if (status === "submitting") return;
                e.currentTarget.style.color = "var(--tr-text)";
                e.currentTarget.style.borderColor = "var(--tr-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = status === "submitting" ? "var(--tr-text-dim)" : "var(--tr-text-muted)";
                e.currentTarget.style.borderColor = "var(--tr-border)";
              }}
            >
              {status === "submitting" ? "Sending…" : "Send"}
              {status !== "submitting" && <span aria-hidden style={{ fontSize: "10px" }}>→</span>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
