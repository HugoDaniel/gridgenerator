import { ITextButtonProps, TextButton } from "../base/buttons";
export interface IDeleteMenuProps {
  className?: string;
  onClearAll: () => void;
}
export const DeleteMenu = (props: IDeleteMenuProps) => {
  const btnProps: ITextButtonProps = {
    onAction: props.onClearAll,
    label: "Clear All",
    className: "sans-serif"
  };
  return (
    <nav
      className={`DeleteMenu ${props.className ||
        ""} ma0 pa0 w3 transition-transform flex flex-column items-center justify-end`}
    >
      <TextButton {...btnProps} />
    </nav>
  );
};
