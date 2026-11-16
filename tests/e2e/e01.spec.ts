import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const answer = "Współtworzyłem automatyzację klasyfikacji wiadomości w obsłudze klienta.";
const contribution = "Sam przygotowałem regułę przekazywania pilnych spraw.";

for (const scenario of [
  { width: 1280, query: "", decision: "Zaproś", quote: answer },
  { width: 320, query: "", decision: "Dopytaj", quote: answer },
  { width: 390, query: "", decision: "Zakończ ocenę", quote: answer },
  { width: 1280, query: "?e01=karta", decision: "Zaproś", quote: contribution },
  { width: 320, query: "?e01=karta", decision: "Dopytaj", quote: contribution },
  { width: 390, query: "?e01=karta", decision: "Zakończ ocenę", quote: contribution },
]) {
  const variant = scenario.query ? "with card" : "standard";
  test(`E01 ${variant} saves ${scenario.decision} at ${scenario.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await page.goto("/#/auth/sign-in?audience=employer");
    await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska" }).click();
    if (scenario.width < 600) {
      await page.getByRole("button", { name: "Otwórz menu" }).click();
    }
    await page.getByRole("link", { name: "Kandydaci", exact: true }).click();
    if (scenario.query) await page.goto(`/#/app/kandydaci${scenario.query}`);
    const search = page.getByRole("textbox", { name: "Szukaj kandydata lub oferty" });
    await search.fill("AI Operations Specialist");
    await expect(page.getByRole("link", { name: "Marek Nowak" })).toHaveCount(0);
    await page.getByRole("link", { name: "Michał Nowak", exact: true }).click();
    const record = page.locator(".recruiting-record");
    await expect(page).toHaveURL(
      new RegExp(`/app/kandydaci/e01-apply${scenario.query ? "\\?e01=karta" : ""}$`),
    );
    await expect(record.getByText(answer, { exact: true })).toBeVisible();
    await expect(record.getByText("O roli Apply", { exact: true })).toBeVisible();
    const card = record.getByRole("region", { name: "Karta własnego wkładu" });
    if (scenario.query) {
      await expect(card).toBeVisible();
      await expect(card.locator("dt")).toHaveText([
        "Co zrobiłeś sam?",
        "Gdzie użyłeś AI?",
        "Jak sprawdziłeś wynik?",
      ]);
      await expect(card).toHaveCSS("border-top-width", "1px");
    } else {
      await expect(card).toHaveCount(0);
    }
    const hasHorizontalScroll = () =>
      page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(await hasHorizontalScroll()).toBe(false);
    const readingOrder = record.locator(
      ".record-reading h3, .e01-review legend, .e01-fragment label, .e01-review > button",
    );
    await expect(readingOrder).toHaveText([
      "O roli Apply",
      "Przesłana aplikacja",
      ...(scenario.query ? ["Karta własnego wkładu"] : []),
      "Następny krok",
      "Fragment zgłoszenia",
      "Zapisz decyzję",
    ]);
    await expect(record.getByRole("radio")).toHaveCount(3);
    const first = record.getByRole("radio", { name: "Zaproś", exact: true });
    await record.getByRole("tab", { name: "Odpowiedź" }).focus();
    for (
      let step = 0;
      step < 4 && !(await first.evaluate((el) => el === document.activeElement));
      step++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(first).toBeFocused();
    await expect(first).not.toBeChecked();
    await page.keyboard.press("Space");
    if (scenario.decision !== "Zaproś") await page.keyboard.press("ArrowRight");
    if (scenario.decision === "Zakończ ocenę") await page.keyboard.press("ArrowRight");
    const selected = record.getByRole("radio", { name: scenario.decision, exact: true });
    await expect(selected).toBeChecked();
    await expect(selected).toBeFocused();
    await expect(selected).toHaveCSS("outline-style", "solid");
    const save = record.getByRole("button", { name: "Zapisz decyzję" });
    await expect(save).toHaveCSS("background-color", "rgb(255, 144, 232)");
    await page.keyboard.press("Tab");
    const picker = record.getByRole("combobox", { name: "Fragment zgłoszenia" });
    await expect(picker).toBeFocused();
    await expect(picker).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Tab");
    await expect(save).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(record.getByRole("alert")).toHaveText("Wskaż fragment zgłoszenia.");
    await expect(picker).toBeFocused();
    await page.keyboard.press("Enter");
    const option = page.getByRole("option").filter({ hasText: scenario.quote });
    await expect(option).toBeVisible();
    expect(await hasHorizontalScroll()).toBe(false);
    await page.keyboard.press("Home");
    if (scenario.query) {
      expect(await option.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("Enter");
    await expect(picker).toContainText(scenario.quote);
    const a11y = await new AxeBuilder({ page }).include(".recruiting-record").analyze();
    expect(a11y.violations.map(({ id }) => id)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("review.png"), fullPage: true });
    await page.keyboard.press("Tab");
    await expect(save).toBeFocused();
    await expect(save).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(record.getByRole("status")).toHaveText("Ocena zapisana");
    await expect(record.getByRole("heading", { name: "Następny krok" })).toBeFocused();
    await expect(record.getByText(scenario.decision, { exact: true })).toBeVisible();
    expect(await hasHorizontalScroll()).toBe(false);
    await page.reload();
    await expect(record.getByText(scenario.decision, { exact: true })).toBeVisible();
    await expect(record.locator("blockquote")).toContainText(scenario.quote);
    await expect(record.getByText("Aplikacja wysłana", { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("result.png"), fullPage: true });
    await record.getByRole("link", { name: "Kandydaci" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/app/kandydaci${scenario.query ? "\\?e01=karta" : ""}$`),
    );
    await page.goto(`/#/app/kandydaci${scenario.query ? "" : "?e01=karta"}`);
    await page.getByRole("link", { name: "Michał Nowak", exact: true }).click();
    await expect(save).toBeVisible();
  });
}
