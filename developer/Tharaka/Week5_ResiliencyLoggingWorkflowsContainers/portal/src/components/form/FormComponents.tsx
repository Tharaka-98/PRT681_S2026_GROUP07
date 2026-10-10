'use client';

/**
 * Thin wrappers that join a KendoReact input to the KendoReact Form's field
 * state: label, hint, and the validation message that appears once a field has
 * been touched. Written once here so every form in the portal behaves the same.
 */
import { Input, NumericTextBox, Checkbox, TextArea } from '@progress/kendo-react-inputs';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Error, Hint, Label } from '@progress/kendo-react-labels';
import { FieldRenderProps } from '@progress/kendo-react-form';

function useFieldState(props: FieldRenderProps) {
  const { validationMessage, touched, visited, label, hint, id, valid, ...rest } = props;
  const showError = Boolean((touched || visited) && validationMessage);
  const hintId = hint ? `${id}_hint` : '';
  const errorId = showError ? `${id}_error` : '';

  return {
    showError,
    describedBy: `${hintId} ${errorId}`.trim(),
    label,
    hint,
    id,
    valid,
    validationMessage,
    rest
  };
}

export function FormInput(props: FieldRenderProps) {
  const f = useFieldState(props);
  return (
    <div className="k-form-field-wrap">
      <Label editorId={f.id} editorValid={f.valid}>{f.label}</Label>
      <Input {...f.rest} id={f.id} valid={f.valid} ariaDescribedBy={f.describedBy} />
      {f.hint && <Hint id={`${f.id}_hint`}>{f.hint}</Hint>}
      {f.showError && <Error id={`${f.id}_error`}>{f.validationMessage}</Error>}
    </div>
  );
}

export function FormTextArea(props: FieldRenderProps) {
  const f = useFieldState(props);
  return (
    <div className="k-form-field-wrap">
      <Label editorId={f.id} editorValid={f.valid}>{f.label}</Label>
      <TextArea {...f.rest} id={f.id} valid={f.valid} rows={3} ariaDescribedBy={f.describedBy} />
      {f.hint && <Hint id={`${f.id}_hint`}>{f.hint}</Hint>}
      {f.showError && <Error id={`${f.id}_error`}>{f.validationMessage}</Error>}
    </div>
  );
}

export function FormNumeric(props: FieldRenderProps) {
  const f = useFieldState(props);
  return (
    <div className="k-form-field-wrap">
      <Label editorId={f.id} editorValid={f.valid}>{f.label}</Label>
      <NumericTextBox {...f.rest} id={f.id} valid={f.valid} ariaDescribedBy={f.describedBy} />
      {f.hint && <Hint id={`${f.id}_hint`}>{f.hint}</Hint>}
      {f.showError && <Error id={`${f.id}_error`}>{f.validationMessage}</Error>}
    </div>
  );
}

export function FormDatePicker(props: FieldRenderProps) {
  const f = useFieldState(props);
  return (
    <div className="k-form-field-wrap">
      <Label editorId={f.id} editorValid={f.valid}>{f.label}</Label>
      <DatePicker {...f.rest} id={f.id} valid={f.valid} ariaDescribedBy={f.describedBy} />
      {f.hint && <Hint id={`${f.id}_hint`}>{f.hint}</Hint>}
      {f.showError && <Error id={`${f.id}_error`}>{f.validationMessage}</Error>}
    </div>
  );
}

export function FormDropDown(props: FieldRenderProps) {
  const f = useFieldState(props);
  return (
    <div className="k-form-field-wrap">
      <Label editorId={f.id} editorValid={f.valid}>{f.label}</Label>
      <DropDownList {...f.rest} id={f.id} valid={f.valid} ariaDescribedBy={f.describedBy} />
      {f.hint && <Hint id={`${f.id}_hint`}>{f.hint}</Hint>}
      {f.showError && <Error id={`${f.id}_error`}>{f.validationMessage}</Error>}
    </div>
  );
}

export function FormCheckbox(props: FieldRenderProps) {
  const { validationMessage, touched, label, id, valid, value, ...rest } = props;
  const showError = Boolean(touched && validationMessage);
  return (
    <div className="k-form-field-wrap" style={{ paddingTop: 22 }}>
      <Checkbox {...rest} id={id} checked={Boolean(value)} label={label} valid={valid} />
      {showError && <Error>{validationMessage}</Error>}
    </div>
  );
}
