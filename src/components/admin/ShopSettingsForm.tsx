import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { shopConfig } from "@/config/shop";
import { legalDraft } from "@/config/shop-legal";
import type { FormAction } from "@/types/form";
import type { ShopSettings } from "@/types/shop";
import { Part } from "./ShopProducts";

const L = shopConfig.limits;

export function ShopSettingsForm({ action, settings }: { action: FormAction; settings: ShopSettings }) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <Part title="Shop open or closed" hint="The master switch." open>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_open" defaultChecked={settings.is_open} className="accent-accent" />
          Shop is open
        </label>
        <p className="text-xs text-ink-soft">
          Closed: every product shows Out of stock and nobody can buy. The shop starts closed.
        </p>
      </Part>

      <Part title="Texts" hint="Label and contact.">
        <Field label="Label on Home" htmlFor="home_title" hint="Optional. Default: Shop.">
          <Input id="home_title" name="home_title" maxLength={L.homeTitle} defaultValue={settings.home_title ?? ""} />
        </Field>
        <Field label="Contact email" htmlFor="contact_email" hint="Shown to buyers for questions and refunds.">
          <Input id="contact_email" name="contact_email" type="email" maxLength={L.email} defaultValue={settings.contact_email ?? ""} />
        </Field>
      </Part>

      <Part title="Terms, Privacy and Refund" hint="Drafts. Have them reviewed before you open the shop.">
        <p className="text-xs text-ink-soft">
          A first draft is filled in for you. It is NOT reviewed by a lawyer. Edit it, fill the words in [brackets], then save.
        </p>
        <Field label="Terms of Sale" htmlFor="terms">
          <Textarea id="terms" name="terms" rows={12} maxLength={L.legal} defaultValue={settings.terms ?? legalDraft.terms} />
        </Field>
        <Field label="Privacy Policy" htmlFor="privacy">
          <Textarea id="privacy" name="privacy" rows={10} maxLength={L.legal} defaultValue={settings.privacy ?? legalDraft.privacy} />
        </Field>
        <Field label="Refund Policy" htmlFor="refund">
          <Textarea id="refund" name="refund" rows={8} maxLength={L.legal} defaultValue={settings.refund ?? legalDraft.refund} />
        </Field>
      </Part>

      <div>
        <SubmitButton variant="accent">Save settings</SubmitButton>
      </div>
    </form>
  );
}