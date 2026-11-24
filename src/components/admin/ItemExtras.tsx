import { Field, Input, Select } from "@/components/ui/Field";
import { itemShapeLabels } from "@/config/site-content";
import { itemShapes, type BlockData } from "@/types/block";

// Extra fields of an item on the Pages screen: shape and download links.
// item_fields=1 tells the server these fields were really on the form (other screens keep the saved values).
export function ItemExtras({ id, data }: { id: string; data?: BlockData }) {
  return (
    <>
      <input type="hidden" name="item_fields" value="1" />
      <div className="sm:col-span-2">
        <Field label="Shape" htmlFor={`${id}-shape`} hint="How this item looks on Home and on its own page.">
          <Select id={`${id}-shape`} name="shape" defaultValue={data?.shape ?? "card"}>
            {itemShapes.map((s) => (
              <option key={s} value={s}>
                {itemShapeLabels[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Nexus Mods link" htmlFor={`${id}-nexus`} hint="Optional. Adds a Nexus Mods download button.">
          <Input id={`${id}-nexus`} name="nexus" type="url" placeholder="https://" defaultValue={data?.nexus ?? ""} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="GitHub release link" htmlFor={`${id}-github`} hint="Optional. Adds a GitHub download button.">
          <Input id={`${id}-github`} name="github" type="url" placeholder="https://" defaultValue={data?.github ?? ""} />
        </Field>
      </div>
    </>
  );
}