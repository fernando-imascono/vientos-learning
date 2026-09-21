/**
 * Disallow raw HTML elements that have shadcn/ui component replacements.
 * Ensures consistent UI by routing all interactive and form elements through
 * the design system.
 */

import { defineRule } from "@oxlint/plugins";

const REPLACEMENTS = new Map([
  ["button", "<Button>"],
  ["input", "<Input>, <Checkbox>, <RadioGroup>, <Switch>, or <Slider>"],
  ["textarea", "<Textarea>"],
  ["label", "<Label>"],
  ["fieldset", "<FieldSet>"],
  ["legend", "<FieldLegend>"],
  ["select", "<Select> or <NativeSelect>"],
  ["option", "<SelectItem> or <NativeSelectOption>"],
  ["optgroup", "<SelectGroup> or <NativeSelectOptGroup>"],
  ["table", "<Table>"],
  ["thead", "<TableHeader>"],
  ["tbody", "<TableBody>"],
  ["tfoot", "<TableFooter>"],
  ["tr", "<TableRow>"],
  ["th", "<TableHead>"],
  ["td", "<TableCell>"],
  ["caption", "<TableCaption>"],
  ["kbd", "<Kbd>"],
  ["hr", "<Separator>"],
  ["progress", "<Progress>"],
  ["dialog", "<Dialog> or <AlertDialog>"],
  ["details", "<Collapsible> or <Accordion>"],
  ["summary", "<CollapsibleTrigger> or <AccordionTrigger>"],
]);

export const noRawHtmlElements = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw HTML elements that have shadcn/ui component replacements.",
    },
    messages: {
      useShadcn: "Use shadcn {{replacement}} instead of <{{element}}>.",
    },
    schema: [],
  },

  createOnce(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const replacement = REPLACEMENTS.get(node.name.name);
        if (!replacement) return;
        context.report({
          node,
          messageId: "useShadcn",
          data: { element: node.name.name, replacement },
        });
      },
    };
  },
});
