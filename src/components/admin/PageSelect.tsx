import { Field, Select } from "@/components/ui/Field";
import { blockPageLabels, blockPages, type BlockPage } from "@/config/site-content";

// Which page of the website a link, project or header shows on.
export function PageSelect({ id, value = "home" }: { id: string; value?: BlockPage }) {
  return (
    <Field
      label="Show on page"
      htmlFor={id}
      hint="Home is the list over the big media. Projects and Writing are their own pages in the menu."
    >
      <Select id={id} name="page" defaultValue={value}>
        {blockPages.map((p) => (
          <option key={p} value={p}>
            {blockPageLabels[p]}
          </option>
        ))}
      </Select>
    </Field>
  );
}