import { Template } from "gridgenerator-data";
import { Button } from "../base/buttons";
import { ITemplateSelectorProps, TemplateSelector } from "./template/selector";
export interface ITemplatePickerProps {
  className?: string;
  templates: Template[];
  onTemplateSelect: (tid: number) => void;
  onCancel: () => void;
}
export const TemplatePicker = (props: ITemplatePickerProps) => (
  <section
    className={`TemplatePicker mw6-ns ml5-ns flex-ns flex-column-reverse justify-start-ns h-100-ns pb6-ns ${props.className ||
      ""}`}
  >
    <TemplateSelector
      templates={props.templates}
      margin={30}
      bg="#cdecff"
      bghover="#f6fffe"
      stroke="#00449e"
      onTemplateSelect={props.onTemplateSelect}
    />
    <div className="fixed bottom-4 mb3 static-ns flex w-100 ml5 pr5 items-center justify-center h2 bg-near-white pr0-ns mb4-ns mt2-ns h3-ns items-center-ns ml0-ns">
      <Button
        className="mr5 mr0-ns b--gray"
        color="gray"
        bg="near-white"
        label="Cancel"
        onAction={props.onCancel}
      />
    </div>
  </section>
);
