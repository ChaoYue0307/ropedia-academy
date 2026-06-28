import { describe, it, expect } from "vitest";
import { pick, t, uiLang } from "./i18n";
import { LABS, colabHref, githubDir, hfSlug, hfUrl, type Lab } from "./labs";

describe("i18n", () => {
  it("picks the right language", () => {
    expect(pick({ en: "Hello", zh: "你好" }, "en")).toBe("Hello");
    expect(pick({ en: "Hello", zh: "你好" }, "zh")).toBe("你好");
    expect(uiLang("both" as never)).toBe("en"); // bilingual UI chrome falls back to English
  });
  it("translates known keys and passes unknown ones through", () => {
    expect(t("navLabs", "en")).toBe("Labs");
    expect(t("__missing__", "en")).toBe("__missing__");
  });
});

describe("labs catalog", () => {
  it("is non-empty and well-formed", () => {
    expect(LABS.length).toBeGreaterThan(20);
    for (const l of LABS) {
      expect(l.file).toMatch(/\.ipynb$/);
      expect(["A", "B", "C", "D", "LM", "AG"]).toContain(l.track);
      expect(["scratch", "foundation", "advanced"]).toContain(l.level);
    }
  });
  it("builds correct Hugging Face + Colab links", () => {
    const lab = {
      file: "LM_nanogpt_pretrain.ipynb", dir: "training", track: "LM", level: "scratch",
      title: { en: "", zh: "" }, action: { en: "", zh: "" },
    } as Lab;
    expect(hfSlug(lab)).toBe("ropedia-nanogpt-shakespeare"); // special-cased slug
    expect(hfUrl(lab)).toBe("https://huggingface.co/cy0307/ropedia-nanogpt-shakespeare");
    expect(colabHref(lab)).toContain("/notebooks/training/LM_nanogpt_pretrain.ipynb");
    expect(githubDir("advanced")).toContain("/notebooks/advanced");
  });
});
